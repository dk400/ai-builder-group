import { CATEGORY_LABEL } from '@/app/_insights'
import { builderBySlug } from '@/app/_builders'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from './_authz'
import { getViewer } from './_authz'
import { STATUS_ORDER, type Status } from './_transitions'
import {
  adminBuilders, adminInsights, adminWorks, pendingQueue,
  BUILDER_ME, REJECT_REASON, type Pending,
} from './_mock'

/* 어드민 조회 계층 — 화면과 데이터 원천 사이의 이음매.

   화면(view)은 소품 모양만 알고 어디서 오는지는 모른다. 그래서 목업(_mock.ts)에서
   Supabase 로 갈아끼울 때 **이 파일만 바뀐다.** 페이지가 _mock 을 직접 import 하고 있으면
   전환할 때 화면까지 같이 뜯어야 하고, 그러면 목업과 실물이 미묘하게 달라진다.

   🔴 빌더 범위 제한은 **쿼리에서** 한다 (FR-A02-01).
      전체를 브라우저로 내려보낸 뒤 화면에서 거르는 구현은 요구사항 미충족이다 — 개발자 도구만
      열면 남의 글 목록이 그대로 보인다. 목업 경로는 지금도 화면에서 거르지만, 실경로는
      .eq() 로 잘라서 애초에 내려가지 않게 한다. RLS 가 한 번 더 막는다.

   ⚠ Supabase 분기는 **실제 프로젝트에서 실행해 검증하지 못했다**(키가 아직 없다).
     컬럼 이름은 supabase/schema.sql 을 그대로 따랐고, FK 이름을 추측해야 하는 임베드 조회
     대신 스칼라 컬럼만 읽고 라벨은 JS 에서 붙인다 — 조인 문법을 잘못 짚어 통째로 실패하는
     경우를 없애려는 것이다. */

export type InsightRow = {
  slug: string; title: string; catLabel: string; author: string
  thumb: string; status: Status; updated: string; owner: string
}

export type WorkRow = {
  slug: string; title: string; tag: string; thumb: string
  builders: string[]; status: Status; updated: string; owner: string
}

/** 'YYYY.MM.DD'. 로케일 포맷터를 쓰지 않는다 — 서버와 브라우저 결과가 갈리면 하이드레이션이 깨진다 */
function ymd(iso: string | null): string {
  return iso ? iso.slice(0, 10).replace(/-/g, '.') : '—'
}

export function statusCounts<T extends { status: Status }>(rows: T[]): Record<Status | 'all', number> {
  const counts = { all: rows.length } as Record<Status | 'all', number>
  for (const s of STATUS_ORDER) counts[s] = rows.filter(r => r.status === s).length
  return counts
}

/* 카테고리·빌더 이름을 한 번씩만 읽어 메모리에서 붙인다.
   행마다 조회하면 그대로 N+1 이고, 어드민 목록은 그게 눈에 띄게 느려지는 첫 화면이다. */
async function labelMaps() {
  const supabase = await createSupabaseServerClient()
  const [cats, builders] = await Promise.all([
    supabase.from('categories').select('id, name'),
    supabase.from('builders').select('id, name'),
  ])
  return {
    catName: new Map((cats.data ?? []).map(c => [c.id as string, c.name as string])),
    builderName: new Map((builders.data ?? []).map(b => [b.id as string, b.name as string])),
  }
}

export async function listInsights(): Promise<InsightRow[]> {
  if (!isSupabaseConfigured) {
    return adminInsights().map(a => ({
      slug: a.slug,
      title: a.title,
      catLabel: CATEGORY_LABEL[a.cat],
      author: a.author,
      thumb: `/assets/img/ins/${a.thumb}`,
      status: a.status,
      updated: a.updated,
      owner: a.owner,
    }))
  }

  const viewer = await getViewer()
  if (!viewer) return []

  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from('insights')
    .select('slug, title, thumb_url, status, updated_at, author_id, category_id')
    .order('updated_at', { ascending: false })

  /* 빌더는 본인 것만. 화면이 아니라 여기서 자른다 */
  if (viewer.role !== 'admin') query = query.eq('author_id', viewer.builderId)

  const [{ data, error }, maps] = await Promise.all([query, labelMaps()])
  if (error || !data) return []

  return data.map(r => ({
    slug: r.slug as string,
    title: r.title as string,
    catLabel: maps.catName.get(r.category_id as string) ?? '—',
    author: maps.builderName.get(r.author_id as string) ?? '—',
    thumb: (r.thumb_url as string | null) ?? '',
    status: r.status as Status,
    updated: ymd(r.updated_at as string | null),
    owner: (r.author_id as string | null) ?? '',
  }))
}

export async function listWorks(): Promise<WorkRow[]> {
  if (!isSupabaseConfigured) {
    return adminWorks().map(w => ({
      slug: w.slug,
      title: w.title,
      tag: w.tag,
      thumb: `/assets/img/${w.cover}`,
      builders: w.builders.flatMap(s => { const b = builderBySlug(s); return b ? [b.name] : [] }),
      status: w.status,
      updated: w.updated,
      owner: w.owner,
    }))
  }

  const viewer = await getViewer()
  if (!viewer) return []

  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from('works')
    .select('id, slug, title, thumb_url, status, updated_at, created_by, category_id')
    .order('updated_at', { ascending: false })

  if (viewer.role !== 'admin') query = query.eq('created_by', viewer.builderId)

  const [{ data, error }, maps] = await Promise.all([query, labelMaps()])
  if (error || !data) return []

  /* 참여 빌더는 연결 테이블에서 한 번에 읽는다 (FR-A04-01 — 누가 만들었는지가 검수의 첫 단서) */
  const ids = data.map(r => r.id as string)
  const { data: links } = ids.length
    ? await supabase.from('work_builders').select('work_id, builder_id, sort').in('work_id', ids)
    : { data: [] as Array<{ work_id: string; builder_id: string; sort: number }> }

  const byWork = new Map<string, string[]>()
  for (const l of (links ?? []).slice().sort((a, b) => a.sort - b.sort)) {
    const name = maps.builderName.get(l.builder_id)
    if (!name) continue
    byWork.set(l.work_id, [...(byWork.get(l.work_id) ?? []), name])
  }

  return data.map(r => ({
    slug: r.slug as string,
    title: r.title as string,
    tag: maps.catName.get(r.category_id as string) ?? '—',
    thumb: (r.thumb_url as string | null) ?? '',
    builders: byWork.get(r.id as string) ?? [],
    status: r.status as Status,
    updated: ymd(r.updated_at as string | null),
    owner: (r.created_by as string | null) ?? '',
  }))
}

/** A-07 승인 대기 — 관리자 전용이라 빌더에게는 빈 목록을 준다 (FR-A07-05).
    화면이 쓰는 모양은 _mock 의 Pending 과 같다 — 전환할 때 뷰를 건드리지 않으려는 것이다. */
export async function listPending(): Promise<Pending[]> {
  if (!isSupabaseConfigured) return pendingQueue()

  const viewer = await getViewer()
  if (!viewer || viewer.role !== 'admin') return []

  const [insights, works] = await Promise.all([listInsights(), listWorks()])
  /* 미리보기 주소는 공개 상세(/insight · /work)가 아니라 /preview 다.
     승인 전 글은 공개 라우트에 아예 없어서 404 가 난다 — 검수자 눈에는 미리보기가
     고장 난 것으로 보였다. /preview 는 같은 뷰를 쓰되 승인 전 원본을 읽는다. */
  const rows: Pending[] = [
    ...insights.filter(r => r.status === 'pending').map(r => ({
      kind: 'Insight' as const, slug: r.slug, title: r.title, author: r.author,
      thumb: r.thumb, submitted: r.updated, href: `/preview/insight/${r.slug}`,
    })),
    ...works.filter(r => r.status === 'pending').map(r => ({
      kind: 'Work' as const, slug: r.slug, title: r.title, author: r.builders[0] ?? '—',
      thumb: r.thumb, submitted: r.updated, href: `/preview/work/${r.slug}`,
    })),
  ]
  /* 오래 기다린 것부터. 검수 큐에서 최신순은 오래된 건을 영원히 뒤로 민다 */
  return rows.sort((a, b) => a.submitted.localeCompare(b.submitted))
}
/** 사이드바 배지 숫자. 역할이 확정되면 한 벌만 계산하면 된다 */
export async function navCounts() {
  const [insights, works, pending] = await Promise.all([listInsights(), listWorks(), listPending()])

  if (isSupabaseConfigured) {
    const builders = (await createSupabaseServerClient())
      .from('builders').select('id', { count: 'exact', head: true })
    const { count } = await builders
    const counts = { insight: insights.length, work: works.length, approvals: pending.length, builders: count ?? 0 }
    /* 실경로에서는 이미 역할에 맞게 잘려 있다 — 두 벌을 계산할 이유가 없다 */
    return { counts, myCounts: counts }
  }

  /* 목업 경로: 역할 전환이 클라이언트에 있어서 서버가 어느 쪽을 쓸지 모른다. 둘 다 준다 */
  const counts = {
    insight: insights.length,
    work: works.length,
    approvals: pending.length,
    builders: adminBuilders().length,
  }
  const myCounts = {
    insight: insights.filter(a => a.owner === BUILDER_ME).length,
    work: works.filter(w => w.owner === BUILDER_ME).length,
    approvals: 0,
    builders: 1,
  }
  return { counts, myCounts }
}

export type BuilderApplication = {
  userId: string
  builderId: string
  name: string
  email: string
  roleLabel: string
  oneLiner: string
  status: 'draft' | 'pending' | 'rejected'
  requestedAt: string | null
}

/** 운영 DB의 실제 빌더 가입·승인 요청 목록. app_metadata는 관리자 키로만 읽는다. */
export async function listBuilderApplications(): Promise<BuilderApplication[]> {
  if (!isSupabaseConfigured) return []
  await requireAdmin()
  const admin = createSupabaseAdminClient()
  const [{ data: builders, error }, { data: users, error: usersError }] = await Promise.all([
    admin.from('builders').select('id, auth_user_id, name, email, role_label, one_liner').eq('role', 'builder'),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])
  if (error || usersError) return []

  const byId = new Map(users.users.map(user => [user.id, user]))
  return (builders ?? []).flatMap(builder => {
    if (!builder.auth_user_id) return []
    const user = byId.get(builder.auth_user_id)
    const status = user?.app_metadata.builder_approval
    if (status !== 'draft' && status !== 'pending' && status !== 'rejected') return []
    return [{
      userId: builder.auth_user_id,
      builderId: builder.id,
      name: builder.name,
      email: builder.email,
      roleLabel: builder.role_label ?? '',
      oneLiner: builder.one_liner ?? '',
      status,
      requestedAt: typeof user?.app_metadata.builder_requested_at === 'string' ? user.app_metadata.builder_requested_at : null,
    }]
  }).sort((a, b) => (b.requestedAt ?? '').localeCompare(a.requestedAt ?? ''))
}

/** 편집 화면 한 건.

    ⚠ 공개 데이터(_insights.ARTICLES)에서 직접 찾으면 안 된다. 어드민에는 아직 공개되지
      않은 글(초안·승인대기·데모 픽스처)이 있고 그것들은 ARTICLES 에 없다. 목록과 편집이
      서로 다른 원천을 보면 "목록엔 있는데 눌러도 안 열리는 글"이 생긴다 — 실제로 겪었다. */
export async function getInsightForEdit(raw: string) {
  const id = safeDecode(raw)
  const rows = await listInsights()
  const row = rows.find(r => r.slug === id) ?? rows.find(r => r.slug === raw)
  if (!row) return null

  if (!isSupabaseConfigured) {
    const full = adminInsights().find(a => a.slug === row.slug)
    if (!full) return null
    return {
      slug: full.slug,
      title: full.title,
      excerpt: full.excerpt,
      cat: full.cat as string,
      author: full.author,
      thumb: `/assets/img/ins/${full.thumb}`,
      bodyHtml: full.bodyHtml ?? null,
      status: full.status,
      updated: full.updated,
    }
  }

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('insights')
    .select('slug, title, excerpt, body_html, thumb_url, category_id, status, updated_at')
    .eq('slug', row.slug)
    .maybeSingle()
  if (!data) return null
  return {
    slug: data.slug as string,
    title: data.title as string,
    excerpt: (data.excerpt as string | null) ?? '',
    cat: (data.category_id as string | null) ?? '',
    author: row.author,
    thumb: (data.thumb_url as string | null) ?? '',
    bodyHtml: (data.body_html as string | null) ?? null,
    status: data.status as Status,
    updated: ymd(data.updated_at as string | null),
  }
}

/** Work 편집 화면 한 건.

    ⚠ getInsightForEdit 과 같은 이유로 공개 데이터(_works.WORKS)에서 찾지 않는다.
      어드민에는 아직 공개되지 않은 프로젝트(초안 · 승인대기 · 데모 픽스처)가 있고
      그것들은 WORKS 에 없다 — 목록에는 뜨는데 눌러도 안 열리는 행이 생긴다. */
export async function getWorkForEdit(raw: string) {
  const id = safeDecode(raw)
  const rows = await listWorks()
  const row = rows.find(r => r.slug === id) ?? rows.find(r => r.slug === raw)
  if (!row) return null

  if (!isSupabaseConfigured) {
    const full = adminWorks().find(w => w.slug === row.slug)
    if (!full) return null
    return {
      slug: full.slug,
      title: full.title,
      summary: full.summary,
      tag: full.tag,
      year: full.year,
      cover: `/assets/img/${full.cover}`,
      withPartner: full.withPartner,
      builders: full.builders,
      status: full.status,
      updated: full.updated,
    }
  }

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('works')
    .select('id, slug, title, summary, thumb_url, period_label, status, updated_at')
    .eq('slug', row.slug)
    .maybeSingle()
  if (!data) return null

  /* 참여 빌더는 **슬러그**로 돌려준다. 편집 폼의 로스터가 슬러그로 맞물리기 때문이다 —
     listWorks 가 주는 이름(표시용)을 그대로 넘기면 체크박스가 하나도 켜지지 않는다. */
  const [{ data: links }, { data: people }] = await Promise.all([
    supabase.from('work_builders').select('builder_id, sort').eq('work_id', data.id as string),
    supabase.from('builders').select('id, slug'),
  ])
  const slugOf = new Map((people ?? []).map(b => [b.id as string, b.slug as string]))
  const builders = (links ?? [])
    .slice()
    .sort((a, b) => (a.sort as number) - (b.sort as number))
    .flatMap(l => { const s = slugOf.get(l.builder_id as string); return s ? [s] : [] })

  return {
    slug: data.slug as string,
    title: data.title as string,
    summary: (data.summary as string | null) ?? '',
    tag: row.tag,
    year: (data.period_label as string | null) ?? '',
    cover: (data.thumb_url as string | null) ?? '',
    /* ⚠ works 테이블에 '똑똑한개발자 공동수행' 컬럼이 아직 없다. 폼에서 끄고 켜도 저장할
       곳이 없으므로 false 로 둔다 — 컬럼(with_partner)이 생기면 여기서 읽는다. */
    withPartner: false,
    builders,
    status: data.status as Status,
    updated: ymd(data.updated_at as string | null),
  }
}

/* 슬러그가 한글이라 이중 인코딩된 요청이 들어와도 살아남게 한 번 더 벗긴다 */
function safeDecode(v: string): string {
  try { return decodeURIComponent(v) } catch { return v }
}

/** 반려 사유 — 편집 화면 상단에 띄운다 (FR-A07-04) */
export async function rejectReasonOf(kind: 'insight' | 'work', slug: string): Promise<string | null> {
  if (!isSupabaseConfigured) return REJECT_REASON[slug] ?? null

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from(kind === 'insight' ? 'insights' : 'works')
    .select('reject_reason')
    .eq('slug', slug)
    .maybeSingle()
  return (data?.reject_reason as string | null) ?? null
}

/* ── 승인 전 미리보기 (FR-A07-02) ─────────────────────────────────────────────
   "미리보기는 공개 화면과 같은 렌더" 가 요구사항이다. 그래서 /preview 라우트가 공개 상세와
   **같은 뷰 컴포넌트**를 쓰고, 아래 두 함수는 거기에 넣을 원본 한 건만 만들어 준다.

   ⚠ 승인 전 글을 공개 라우트(/insight/[slug] · /work/[slug])로 흘리지 않는다. 그 둘의 원천은
     ARTICLES · WORKS 이고, 거기 넣는 순간 초안 · 승인대기 글이 사이트맵까지 따라 올라간다.

   🔴 /preview 는 **인증이 붙어야 하는 경로**다 (백로그 §A-07 — PRD D3, 공개 토큰 URL 금지).
     지금은 어드민 전체가 그렇듯 열려 있고, noindex + robots 차단으로만 막혀 있다.
     4단계 미들웨어 게이트(FR-A00-01)에 /admin 과 함께 /preview 를 반드시 넣을 것. */

export type InsightPreview = {
  slug: string; cat: string; catLabel: string; title: string
  thumbSrc: string; author: string; authorType: 'team' | 'partner'
  date: string; readMin: number | null; bodyHtml: string | null; status: Status
}

export type WorkPreview = {
  slug: string; cat: string; title: string; summary: string; tag: string; year: string
  coverSrc: string; coverAlt: string; withPartner: boolean
  builders: Array<{ slug: string; name: string; avatar: string; roleLabel: string }>
  bodyProblem: string | null; bodySolution: string | null; bodyResult: string | null
  status: Status
}

export async function getInsightPreview(raw: string): Promise<InsightPreview | null> {
  const id = safeDecode(raw)

  if (!isSupabaseConfigured) {
    /* 목업에는 서버가 아는 역할이 없다. 열람 제한은 실경로 분기에만 있다 —
       role.tsx 주석과 같은 이유로, 이 코드를 4단계로 그대로 가져가면 안 된다. */
    const a = adminInsights().find(x => x.slug === id) ?? adminInsights().find(x => x.slug === raw)
    if (!a) return null
    return {
      slug: a.slug, cat: a.cat, catLabel: CATEGORY_LABEL[a.cat], title: a.title,
      thumbSrc: `/assets/img/ins/${a.thumb}`, author: a.author,
      authorType: a.source === 'own' ? 'team' : 'partner',
      date: a.date, readMin: a.readMin ?? null, bodyHtml: a.bodyHtml ?? null, status: a.status,
    }
  }

  const viewer = await getViewer()
  if (!viewer) return null

  const supabase = await createSupabaseServerClient()
  const [{ data }, maps] = await Promise.all([
    supabase
      .from('insights')
      .select('slug, title, body_html, thumb_url, category_id, author_id, status, published_at, updated_at')
      .eq('slug', id)
      .maybeSingle(),
    labelMaps(),
  ])
  if (!data) return null
  /* 남의 초안은 작성자와 관리자만 본다 (FR-A02-01). 화면이 아니라 여기서 자른다 */
  if (viewer.role !== 'admin' && data.author_id !== viewer.builderId) return null

  return {
    slug: data.slug as string,
    cat: (data.category_id as string | null) ?? '',
    catLabel: maps.catName.get(data.category_id as string) ?? '—',
    title: data.title as string,
    thumbSrc: (data.thumb_url as string | null) ?? '',
    author: maps.builderName.get(data.author_id as string) ?? '—',
    /* 파트너 공동 발행 여부(_insights 의 source)는 아직 컬럼이 없다. 생기면 여기서 읽는다 */
    authorType: 'team',
    date: ymd((data.published_at as string | null) ?? (data.updated_at as string | null)),
    /* 읽는 데 걸리는 시간도 컬럼이 없다. 없으면 뷰가 그 자리를 지운다 */
    readMin: null,
    bodyHtml: (data.body_html as string | null) ?? null,
    status: data.status as Status,
  }
}

export async function getWorkPreview(raw: string): Promise<WorkPreview | null> {
  const id = safeDecode(raw)
  /* 참여 빌더 칩은 공개 상세와 같은 규칙으로 만든다 — 첫 번째가 리드다 */
  const chips = (slugs: string[]) => slugs.flatMap((s, i) => {
    const b = builderBySlug(s)
    return b ? [{ slug: b.slug, name: b.name, avatar: b.avatar, roleLabel: i === 0 ? '리드' : '참여' }] : []
  })

  if (!isSupabaseConfigured) {
    const w = adminWorks().find(x => x.slug === id) ?? adminWorks().find(x => x.slug === raw)
    if (!w) return null
    return {
      slug: w.slug, cat: w.cat, title: w.title, summary: w.summary, tag: w.tag, year: w.year,
      coverSrc: `/assets/img/${w.cover}`, coverAlt: w.coverAlt, withPartner: w.withPartner,
      builders: chips(w.builders),
      bodyProblem: w.bodyProblem ?? null,
      bodySolution: w.bodySolution ?? null,
      bodyResult: w.bodyResult ?? null,
      status: w.status,
    }
  }

  const viewer = await getViewer()
  if (!viewer) return null

  const supabase = await createSupabaseServerClient()
  const [{ data }, maps] = await Promise.all([
    supabase
      .from('works')
      .select('id, slug, title, summary, thumb_url, hero_url, body_problem, body_solution, body_result, period_label, category_id, created_by, status')
      .eq('slug', id)
      .maybeSingle(),
    labelMaps(),
  ])
  if (!data) return null
  if (viewer.role !== 'admin' && data.created_by !== viewer.builderId) return null

  /* 빌더 슬러그는 연결 테이블에만 있다. 이름·아바타는 공개 로스터(_builders)에서 붙인다 —
     getWorkForEdit 가 슬러그를 돌려주는 것과 같은 이유다. */
  const [{ data: links }, { data: people }] = await Promise.all([
    supabase.from('work_builders').select('builder_id, sort').eq('work_id', data.id as string),
    supabase.from('builders').select('id, slug'),
  ])
  const slugOf = new Map((people ?? []).map(b => [b.id as string, b.slug as string]))
  const builderSlugs = (links ?? [])
    .slice()
    .sort((a, b) => (a.sort as number) - (b.sort as number))
    .flatMap(l => { const s = slugOf.get(l.builder_id as string); return s ? [s] : [] })

  return {
    slug: data.slug as string,
    cat: (data.category_id as string | null) ?? '',
    title: data.title as string,
    summary: (data.summary as string | null) ?? '',
    tag: maps.catName.get(data.category_id as string) ?? '—',
    year: (data.period_label as string | null) ?? '',
    coverSrc: (data.hero_url as string | null) ?? (data.thumb_url as string | null) ?? '',
    /* alt 컬럼이 없다. 커버는 제목 바로 아래의 장식이라 빈 alt 가 맞다 (NFR 접근성) */
    coverAlt: '',
    /* works 에 '똑똑한개발자 공동수행' 컬럼이 아직 없다 — getWorkForEdit 와 같은 이유로 false */
    withPartner: false,
    builders: chips(builderSlugs),
    bodyProblem: (data.body_problem as string | null) ?? null,
    bodySolution: (data.body_solution as string | null) ?? null,
    bodyResult: (data.body_result as string | null) ?? null,
    status: data.status as Status,
  }
}
