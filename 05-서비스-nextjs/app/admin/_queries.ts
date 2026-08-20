import { CATEGORY_LABEL } from '@/app/_insights'
import { builderBySlug } from '@/app/_builders'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
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
  const rows: Pending[] = [
    ...insights.filter(r => r.status === 'pending').map(r => ({
      kind: 'Insight' as const, slug: r.slug, title: r.title, author: r.author,
      thumb: r.thumb, submitted: r.updated, href: `/insight/${r.slug}`,
    })),
    ...works.filter(r => r.status === 'pending').map(r => ({
      kind: 'Work' as const, slug: r.slug, title: r.title, author: r.builders[0] ?? '—',
      thumb: r.thumb, submitted: r.updated, href: `/work/${r.slug}`,
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
