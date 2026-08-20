'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sanitizeBodyHtml, sanitizePlainText } from '@/lib/sanitize'
import { AuthzError, assertCanEdit, assertCanTransition, assertOwnership, requireViewer } from './_authz'
import { needsRedirectOnArchive, type Status } from './_transitions'

/* 어드민 서버 액션 — FR-A03 · FR-A05 · FR-A07 · DR-02 · NFR-11 · NFR-13

   폼 제출은 전부 여기를 지난다. 브라우저는 Supabase 를 직접 부르지 않는다 (DR-02).

   층은 매번 같은 순서다:

     1. 입력 검증 (zod)        — 없는 필드·빈 슬러그가 DB 까지 가지 않게
     2. 권한 (_authz)          — 로그인·역할·소유·상태 전이
     3. 정화 (sanitize)        — 저장 직전 한 번. 브라우저에서 거른 것은 세지 않는다
     4. 쓰기 (Supabase)        — RLS 가 여기서 한 번 더 막는다
     5. 재검증 (revalidatePath)— 공개 페이지가 정적이라 이걸 빼면 영원히 안 바뀐다

   ⚠ 액션은 예외를 던지지 않고 결과 객체를 돌려준다. 서버 액션에서 던진 예외는 프로덕션에서
     메시지가 지워진 채 클라이언트에 도착해서, 사용자에게 "무엇이 잘못됐는지"를 못 알려준다. */

export type ActionResult =
  | { ok: true; slug?: string }
  | { ok: false; error: string }

type Kind = 'insight' | 'work'

const TABLE: Record<Kind, string> = { insight: 'insights', work: 'works' }
const OWNER_COL: Record<Kind, string> = { insight: 'author_id', work: 'created_by' }
const PUBLIC_BASE: Record<Kind, string> = { insight: '/insight', work: '/work' }

/* 슬러그는 주소가 된다. 한글을 허용하되 공백·슬래시·물음표는 막는다 —
   규칙 전문은 06-이관/라우트-슬러그-규칙표.md §3 */
const slugSchema = z
  .string()
  .trim()
  .min(2, '슬러그를 입력하세요.')
  .max(80, '슬러그가 너무 깁니다.')
  .regex(/^[\p{L}\p{N}][\p{L}\p{N}-]*$/u, '슬러그에는 글자·숫자·하이픈만 쓸 수 있습니다.')

const saveSchema = z.object({
  kind: z.enum(['insight', 'work']),
  id: z.string().uuid().nullable(),
  slug: slugSchema,
  title: z.string().trim().min(1, '제목을 입력하세요.').max(120),
  excerpt: z.string().trim().max(300).default(''),
  bodyHtml: z.string().default(''),
  categoryId: z.string().uuid().nullable().default(null),
  thumbUrl: z.string().trim().default(''),
  seoTitle: z.string().trim().max(120).default(''),
  seoDescription: z.string().trim().max(300).default(''),
})

const statusSchema = z.object({
  kind: z.enum(['insight', 'work']),
  id: z.string().uuid(),
  to: z.enum(['draft', 'pending', 'published', 'rejected', 'archived']),
  reason: z.string().trim().max(500).nullable().default(null),
})

function fail(e: unknown): ActionResult {
  if (e instanceof AuthzError) return { ok: false, error: e.message }
  if (e instanceof z.ZodError) return { ok: false, error: e.issues[0]?.message ?? '입력값을 확인하세요.' }
  console.error('[admin action]', e)
  return { ok: false, error: '저장하지 못했습니다. 잠시 후 다시 시도해 주세요.' }
}

function notConfigured(): ActionResult {
  return {
    ok: false,
    error: 'Supabase 가 연결되지 않았습니다. 지금은 목업이라 저장되지 않습니다.',
  }
}

/** 공개 페이지 재검증 — FR-A03-08 (60초 이내 반영, NFR-05) */
function revalidateContent(kind: Kind, slug: string): void {
  revalidatePath(PUBLIC_BASE[kind])
  revalidatePath(`${PUBLIC_BASE[kind]}/${slug}`)
  revalidatePath('/')          // 홈 프리뷰 섹션
  revalidatePath('/sitemap.xml')
  revalidatePath('/llms.txt')
}

/* ─────────────────────────────────────────────────────────────────────────
   저장 — 새 글이면 draft 로 만들고, 기존 글이면 내용만 바꾼다.
   상태는 여기서 건드리지 않는다. 전이는 changeStatus 하나로 모은다.
   ───────────────────────────────────────────────────────────────────────── */
export async function saveContent(input: unknown): Promise<ActionResult> {
  if (!isSupabaseConfigured) return notConfigured()

  try {
    const v = saveSchema.parse(input)
    const viewer = await requireViewer()
    const supabase = await createSupabaseServerClient()
    const table = TABLE[v.kind]
    const ownerCol = OWNER_COL[v.kind]

    /* 저장 직전에 한 번. 에디터에서 걸러진 값이라는 보장이 없다 (NFR-13) */
    const body = sanitizeBodyHtml(v.bodyHtml)
    const patch: Record<string, unknown> = {
      slug: v.slug,
      title: sanitizePlainText(v.title),
      category_id: v.categoryId,
      seo_title: sanitizePlainText(v.seoTitle) || null,
      seo_description: sanitizePlainText(v.seoDescription) || null,
    }
    if (v.kind === 'insight') {
      patch.excerpt = sanitizePlainText(v.excerpt) || null
      patch.body_html = body
      patch.thumb_url = v.thumbUrl || null
    } else {
      patch.summary = sanitizePlainText(v.excerpt) || null
      patch.thumb_url = v.thumbUrl || null
    }

    if (v.id === null) {
      patch[ownerCol] = viewer.builderId
      patch.status = 'draft'
      const { error } = await supabase.from(table).insert(patch)
      if (error) return { ok: false, error: dbMessage(error.message) }
      revalidateContent(v.kind, v.slug)
      return { ok: true, slug: v.slug }
    }

    /* 기존 글 — 소유·편집 가능 여부를 먼저 본다.
       select 로 현재 상태를 가져오는 이유: DR-07(제출 후 잠금)은 상태를 알아야 판정된다. */
    const { data: current, error: readError } = await supabase
      .from(table)
      .select(`slug, status, ${ownerCol}`)
      .eq('id', v.id)
      .maybeSingle()

    if (readError || !current) return { ok: false, error: '대상을 찾을 수 없습니다.' }

    const row = current as unknown as Record<string, string>
    const status = row.status as Status
    assertOwnership(viewer, row[ownerCol] ?? null)
    assertCanEdit(viewer, status)

    /* FR-A03-05 — 발행된 뒤 슬러그가 바뀌면 구 주소가 죽는다. 301 을 자동으로 만든다.
       (SR-06 · DR-08 과 같은 테이블을 쓴다) */
    const previousSlug = row.slug
    if (previousSlug && previousSlug !== v.slug && status === 'published') {
      const { error: redirectError } = await supabase.from('redirects').upsert({
        from_path: `${PUBLIC_BASE[v.kind]}/${previousSlug}`,
        to_path: `${PUBLIC_BASE[v.kind]}/${v.slug}`,
      })
      if (redirectError) return { ok: false, error: '리다이렉트를 만들지 못해 슬러그를 바꾸지 않았습니다.' }
    }

    const { error } = await supabase.from(table).update(patch).eq('id', v.id)
    if (error) return { ok: false, error: dbMessage(error.message) }

    revalidateContent(v.kind, v.slug)
    if (previousSlug && previousSlug !== v.slug) revalidateContent(v.kind, previousSlug)
    return { ok: true, slug: v.slug }
  } catch (e) {
    return fail(e)
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   상태 전이 — 제출 · 승인 · 반려 · 내리기가 전부 이 하나를 지난다.
   ───────────────────────────────────────────────────────────────────────── */
export async function changeStatus(input: unknown): Promise<ActionResult> {
  if (!isSupabaseConfigured) return notConfigured()

  try {
    const v = statusSchema.parse(input)
    const viewer = await requireViewer()
    const supabase = await createSupabaseServerClient()
    const table = TABLE[v.kind]
    const ownerCol = OWNER_COL[v.kind]

    const { data: current, error: readError } = await supabase
      .from(table)
      .select(`slug, status, ${ownerCol}`)
      .eq('id', v.id)
      .maybeSingle()

    if (readError || !current) return { ok: false, error: '대상을 찾을 수 없습니다.' }

    const row = current as unknown as Record<string, string>
    const from = row.status as Status
    assertOwnership(viewer, row[ownerCol] ?? null)
    assertCanTransition(viewer, from, v.to, v.reason)

    const patch: Record<string, unknown> = { status: v.to }
    /* 반려 사유는 필수이고(assertCanTransition 이 이미 확인), 다시 올라오거나 공개되면 지운다.
       DB 트리거도 같은 일을 한다 — 둘 중 하나가 빠져도 규칙이 지켜지게 (schema.sql §7) */
    patch.reject_reason = v.to === 'rejected' ? sanitizePlainText(v.reason ?? '') : null

    const { error } = await supabase.from(table).update(patch).eq('id', v.id)
    if (error) return { ok: false, error: dbMessage(error.message) }

    /* DR-08 — 내린 글은 404 가 아니라 목록으로 301 */
    if (needsRedirectOnArchive(v.to) && row.slug) {
      await supabase.from('redirects').upsert({
        from_path: `${PUBLIC_BASE[v.kind]}/${row.slug}`,
        to_path: PUBLIC_BASE[v.kind],
      })
    }

    revalidatePath('/admin/insight')
    revalidatePath('/admin/work')
    revalidatePath('/admin/approvals')
    if (row.slug) revalidateContent(v.kind, row.slug)
    return { ok: true, slug: row.slug }
  } catch (e) {
    return fail(e)
  }
}

/* Postgres 오류를 사람이 읽을 문장으로. 원문을 그대로 노출하면 테이블·컬럼 이름이 새어나가고,
   사용자에게는 아무 의미도 없다. 트리거가 던진 우리 문장은 그대로 살린다. */
function dbMessage(raw: string): string {
  if (raw.includes('duplicate key') && raw.includes('slug')) {
    return '같은 슬러그가 이미 있습니다. 다른 값을 쓰세요.'
  }
  if (raw.includes('row-level security')) {
    return '권한이 없습니다.'
  }
  if (raw.includes('허용되지 않은') || raw.includes('반려 사유') || raw.includes('검수 중')) {
    return raw
  }
  console.error('[admin action:db]', raw)
  return '저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}
