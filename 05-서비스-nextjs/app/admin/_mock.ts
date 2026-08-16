/* 어드민 목업이 쓰는 파생 데이터.

   상태(status)·수정일·작성자는 아직 어디에도 저장되지 않는다 — 2단계에서 works·insights
   테이블의 컬럼이 된다. 그때까지 화면을 채우려고 여기서 슬러그에 상태를 붙여 둔다.

   랜덤이 아니라 고정 표인 이유 — 새로고침마다 상태가 바뀌면 리뷰가 불가능하고, 빌드마다
   결과가 달라지면 정적 생성과도 안 맞는다. 다섯 가지 상태가 모두 한 번씩은 보이도록 골랐다.

   ⚠ 이 파일은 2단계에서 통째로 사라진다. 공개 화면은 이 파일을 import 하지 않는다. */

import { WORKS, type Work } from '@/app/_works'
import { ARTICLES, type Article } from '@/app/_insights'
import { BUILDERS, builderBySlug } from '@/app/_builders'

export type Status = 'draft' | 'pending' | 'published' | 'rejected' | 'archived'

export const STATUS_LABEL: Record<Status, string> = {
  draft: '초안',
  pending: '승인대기',
  published: '발행',
  rejected: '반려',
  archived: '보관',
}

/* 상태 머신(§7.3)에서 각 상태가 할 수 있는 일. 목록의 버튼을 이 표로 그린다 */
export const STATUS_ORDER: Status[] = ['draft', 'pending', 'published', 'rejected', 'archived']

const INSIGHT_STATUS: Record<string, Status> = {
  '바이브코딩-외주-고르는법': 'published',
  '3주-랜딩페이지-제작순서': 'pending',
  'ai툴-실무도입-검증기준': 'draft',
  'ai-poc-도입전-검증': 'published',
  'ai에이전트-도입-체크리스트': 'published',
  'ai도입-ax-차이-업무설계': 'published',
  '기업ai-도입-거버넌스': 'rejected',
  '개발외주-견적-비교법': 'published',
  '외주개발-턴키팀-이유': 'published',
  '토스-미니게임-프로젝트': 'archived',
  'ai네이티브-에이전시-운영법': 'published',
}

const WORK_STATUS: Record<string, Status> = {
  '커머스-리빙-리뉴얼': 'published',
  'ai-업무플랫폼-daisy': 'published',
  'o2o-예약-사용자앱': 'published',
  '핀테크-결제-어드민': 'published',
  'saas-지점정산-운영콘솔': 'pending',
  '미디어-광고-셀프집행': 'published',
  '커머스-복지몰-edk': 'draft',
  'ai-심리분석-canape': 'published',
  '플랫폼-돌봄-연결': 'archived',
}

/* 수정일. 발행일과 다른 값이어야 "언제 마지막으로 손댔나"가 의미를 갖는다 */
const UPDATED: Record<string, string> = {
  '3주-랜딩페이지-제작순서': '2026.08.14',
  'ai툴-실무도입-검증기준': '2026.08.15',
  '기업ai-도입-거버넌스': '2026.08.12',
  'saas-지점정산-운영콘솔': '2026.08.13',
  '커머스-복지몰-edk': '2026.08.15',
}

/* 반려 사유는 필수 입력이다 (FR-A07-04) — 반려된 건에는 반드시 값이 있다 */
export const REJECT_REASON: Record<string, string> = {
  '기업ai-도입-거버넌스': '3장 도입부의 통계 출처가 빠졌습니다. 원 자료 링크를 달아 다시 제출해 주세요.',
}

export type AdminInsight = Article & { status: Status; updated: string }
export type AdminWork = Work & { status: Status; updated: string; leadName: string }

export function adminInsights(): AdminInsight[] {
  return ARTICLES.map(a => ({
    ...a,
    status: INSIGHT_STATUS[a.slug] ?? 'draft',
    updated: UPDATED[a.slug] ?? a.date,
  }))
}

export function adminWorks(): AdminWork[] {
  return WORKS.map(w => {
    const lead = w.builders[0] ? builderBySlug(w.builders[0]) : undefined
    return {
      ...w,
      status: WORK_STATUS[w.slug] ?? 'draft',
      updated: UPDATED[w.slug] ?? `${w.year}.12.01`,
      leadName: lead?.name ?? '—',
    }
  })
}

export function countBy<T extends { status: Status }>(rows: T[], s: Status | 'all'): number {
  return s === 'all' ? rows.length : rows.filter(r => r.status === s).length
}

/* 승인 대기 큐 — Work·Insight 를 한 목록에 담는다 (FR-A07-01) */
export type Pending = {
  kind: 'Work' | 'Insight'
  slug: string
  title: string
  author: string
  thumb: string
  submitted: string
  href: string
}

export function pendingQueue(): Pending[] {
  const ins = adminInsights().filter(a => a.status === 'pending').map(a => ({
    kind: 'Insight' as const, slug: a.slug, title: a.title, author: a.author,
    thumb: `/assets/img/ins/${a.thumb}`, submitted: a.updated, href: `/insight/${a.slug}`,
  }))
  const wk = adminWorks().filter(w => w.status === 'pending').map(w => ({
    kind: 'Work' as const, slug: w.slug, title: w.title, author: w.leadName,
    thumb: `/assets/img/${w.cover}`, submitted: w.updated, href: `/work/${w.slug}`,
  }))
  return [...ins, ...wk].sort((a, b) => a.submitted.localeCompare(b.submitted))
}

/* 빌더 계정. email·최근 로그인은 2단계에서 builders 테이블 컬럼이 된다.
   ⚠ 이메일은 실제 주소가 아니라 example.com 자리표시자다 — 실주소를 목업에 넣지 않는다. */
export function adminBuilders() {
  return BUILDERS.map((b, i) => ({
    ...b,
    email: `${b.slug}@example.com`,
    accountRole: i === 0 ? ('admin' as const) : ('builder' as const),
    active: b.slug !== 'junho',
    lastLogin: b.slug === 'junho' ? '—' : ['2026.08.16', '2026.08.15', '2026.08.11', '2026.07.29'][i % 4]!,
  }))
}
