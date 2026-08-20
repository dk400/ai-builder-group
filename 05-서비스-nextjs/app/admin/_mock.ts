/* 어드민 목업이 쓰는 파생 데이터.

   상태(status)·수정일·작성자는 아직 어디에도 저장되지 않는다 — 2단계에서 works·insights
   테이블의 컬럼이 된다. 그때까지 화면을 채우려고 여기서 슬러그에 상태를 붙여 둔다.

   랜덤이 아니라 고정 표인 이유 — 새로고침마다 상태가 바뀌면 리뷰가 불가능하고, 빌드마다
   결과가 달라지면 정적 생성과도 안 맞는다. 다섯 가지 상태가 모두 한 번씩은 보이도록 골랐다.

   ⚠ 이 파일은 2단계에서 통째로 사라진다. 공개 화면은 이 파일을 import 하지 않는다. */

import { WORKS, type Work } from '@/app/_works'
import { ARTICLES, type Article } from '@/app/_insights'
import { BUILDERS, builderBySlug } from '@/app/_builders'

/* 상태 머신은 목업 소유가 아니다. 이 파일은 4단계에서 사라지지만 상태 규칙은 남는다 —
   정의는 ./_transitions.ts 한 곳이고 여기서는 다시 내보내기만 한다.
   (같은 유니온을 두 곳에 적어 두면 한쪽만 고쳐지는 날이 온다) */
export type { Status } from './_transitions'
export { STATUS_LABEL, STATUS_ORDER } from './_transitions'
import type { Status } from './_transitions'

const INSIGHT_STATUS: Record<string, Status> = {
  '바이브코딩-외주-고르는법': 'published',
  /* 공개 사이트에 이미 나가 있는 글이다. 'pending' 으로 두면 어드민 상태와 실제
     노출이 어긋나고, 데모의 승인대기 샘플과도 중복된다 */
  '3주-랜딩페이지-제작순서': 'published',
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
  '플랫폼-돌봄-연결': 'rejected',
}

/* 콘텐츠의 주인.

   빌더로 로그인하면 "본인 것만" 보인다 (FR-A02-01 · FR-A04-01). 그 규칙을 확인하려면
   빌더가 소유한 콘텐츠가 실제로 있어야 한다.

   Work 은 리드 빌더(builders[0])가 주인이라 따로 적지 않는다. Insight 는 소유 개념이
   데이터에 없어서 여기서 붙인다 — 적지 않은 글은 운영팀(josh)이 주인이다. */
const INSIGHT_OWNER: Record<string, string> = {
  '3주-랜딩페이지-제작순서': 'ria',
  'ai툴-실무도입-검증기준': 'sein',
}

export const ADMIN_ACCOUNT = 'josh'

/* 빌더로 볼 때 '나'로 삼을 계정.

   ⚠ role.tsx 가 아니라 여기에 둔다. role.tsx 는 'use client' 라서, 서버 컴포넌트가 거기서
   상수를 import 하면 문자열이 아니라 클라이언트 참조 프록시가 온다 — 비교가 조용히 전부
   false 가 되고 사이드바 건수가 0 으로 나온다. 실제로 그렇게 한 번 틀렸다. */
export const BUILDER_ME = 'ria'

/* 수정일. 발행일과 다른 값이어야 "언제 마지막으로 손댔나"가 의미를 갖는다 */
const UPDATED: Record<string, string> = {
  '3주-랜딩페이지-제작순서': '2026.08.14',
  'ai툴-실무도입-검증기준': '2026.08.15',
  '기업ai-도입-거버넌스': '2026.08.12',
  'saas-지점정산-운영콘솔': '2026.08.13',
  '커머스-복지몰-edk': '2026.08.15',
  '플랫폼-돌봄-연결': '2026.08.14',
}

/* 반려 사유는 필수 입력이다 (FR-A07-04) — 반려된 건에는 반드시 값이 있다 */
export const REJECT_REASON: Record<string, string> = {
  '샘플-반려된-글': '두 번째 소제목의 주장에 근거가 없습니다. 실제로 겪은 사례나 수치를 한 줄 넣어 다시 제출해 주세요. 그리고 썸네일이 본문 내용과 맞지 않습니다.',
  '기업ai-도입-거버넌스': '3장 도입부의 통계 출처가 빠졌습니다. 원 자료 링크를 달아 다시 제출해 주세요.',
  '플랫폼-돌봄-연결': '히어로 이미지에 실제 이용자 얼굴이 그대로 보입니다. 마스킹하거나 다른 컷으로 교체 후 다시 제출해 주세요.',
}

export type AdminInsight = Article & { status: Status; updated: string; owner: string }
export type AdminWork = Work & { status: Status; updated: string; leadName: string; owner: string }

/* 검수 흐름을 실제로 걸어 보기 위한 데모 글 두 건.

   ⚠ **ARTICLES 에 넣지 않는다.** 그 배열은 공개 사이트(/insight · sitemap · llms.txt)의
     원천이라, 거기 넣으면 초안·승인대기 글이 그대로 공개된다. 어드민에서만 보이는
     픽스처는 여기 따로 둔다.

   왜 필요했나 — 빌더 시점으로 보면 **편집할 수 있는 글이 하나도 없었다.** 리아가 가진 글은
   승인대기 한 건뿐이고 그건 DR-07 로 잠긴다. 잠긴 화면만 보이면 "고장났나"로 읽힌다.

     샘플-승인대기-글   관리자: 승인 · 반려를 눌러 본다  /  빌더: 잠금 안내를 본다
     샘플-작성중-글     빌더가 자유롭게 고치고 "검토 요청"까지 눌러 본다

   Supabase 가 붙으면 이 배열은 사라지고 실제 행이 그 자리를 대신한다. */
const DEMO_INSIGHTS: AdminInsight[] = [
  {
    slug: '샘플-작성중-글', cat: 'guide',
    title: '[샘플 ①] 작성 중 — 자유롭게 수정할 수 있습니다',
    excerpt: '아직 제출하지 않은 초안입니다. 제목·본문·썸네일·주소를 모두 고칠 수 있고, 다 되면 검토를 요청합니다.',
    thumb: 'ins-turnkey.jpg', source: 'own', author: '빌더 리아', date: '2026.08.21', readMin: 2,
    bodyHtml: '<h2 id="여기를-고쳐-보세요">여기를 고쳐 보세요</h2><p>툴바로 소제목·굵게·목록·링크를 넣어 볼 수 있습니다. H1 은 없습니다 — 페이지 제목이 h1 이라 본문은 H2 부터 시작합니다.</p><h2 id="다음-단계">다음 단계</h2><p>아래 <strong>검토 요청</strong> 을 누르면 ② 상태로 넘어가고, 그때부터 작성자는 수정할 수 없습니다.</p>',
    status: 'draft', updated: '2026.08.21', owner: BUILDER_ME,
  },
  {
    slug: '샘플-승인대기-글', cat: 'how',
    title: '[샘플 ②] 검토 요청됨 — 관리자 승인 대기',
    excerpt: '빌더가 제출해 검수를 기다리는 상태입니다. 관리자에게는 승인·반려가 보이고, 작성자에게는 폼이 잠깁니다.',
    thumb: 'ins-native.jpg', source: 'own', author: '빌더 리아', date: '2026.08.20', readMin: 3,
    bodyHtml: '<h2 id="확인할-것">확인할 것</h2><p>관리자로 보면 <strong>승인 · 공개</strong> 와 <strong>반려</strong> 가 보입니다. 반려를 누르면 사유 입력이 열리고, 비어 있으면 보낼 수 없습니다.</p><h2 id="빌더로-보면">빌더로 보면</h2><p>폼 전체가 잠기고 왜 잠겼는지가 표시됩니다. 검수 중에 원본이 바뀌면 승인한 내용과 공개된 내용이 달라지기 때문입니다.</p>',
    status: 'pending', updated: '2026.08.20', owner: BUILDER_ME,
  },
  {
    slug: '샘플-반려된-글', cat: 'how',
    title: '[샘플 ③] 반려됨 — 사유를 보고 다시 고칩니다',
    excerpt: '관리자가 사유와 함께 돌려보낸 상태입니다. 작성자는 사유를 보고 고친 뒤 다시 검토를 요청합니다.',
    thumb: 'ins-gov.jpg', source: 'own', author: '빌더 리아', date: '2026.08.19', readMin: 2,
    bodyHtml: '<h2 id="반려의-의미">반려의 의미</h2><p>거절이 아니라 되돌림입니다. 화면 맨 위에 사유가 붙어 있고, 폼은 다시 열려 있습니다.</p><h2 id="사유가-필수인-이유">사유가 필수인 이유</h2><p>사유 없는 반려는 “안 됨”만 전달합니다. 무엇을 고쳐야 하는지 없으면 다시 올라오는 것도 같은 상태입니다.</p>',
    status: 'rejected', updated: '2026.08.19', owner: BUILDER_ME,
  },
  {
    slug: '샘플-발행된-글', cat: 'project',
    title: '[샘플 ④] 발행됨 — 공개 중, 내릴 수 있습니다',
    excerpt: '승인되어 공개된 상태입니다. 작성자는 더 이상 손대지 못하고, 관리자만 수정하거나 내릴 수 있습니다.',
    thumb: 'ins-ax.jpg', source: 'own', author: '빌더 리아', date: '2026.08.18', readMin: 3,
    bodyHtml: '<h2 id="여기서부터는-관리자-몫">여기서부터는 관리자 몫</h2><p>공개 중인 글이 검수 없이 바뀌면 안 되기 때문입니다(PRD §7.3 편집 주체 = 관리자).</p><h2 id="내리면">내리면</h2><p><strong>내리기</strong> 를 누르면 ⑤ 보관 상태가 되고, 그 주소는 404 가 아니라 목록으로 301 됩니다 — 색인과 공유 링크를 버리지 않습니다.</p>',
    status: 'published', updated: '2026.08.18', owner: BUILDER_ME,
  },
  {
    slug: '샘플-보관된-글', cat: 'project',
    title: '[샘플 ⑤] 보관됨 — 내려간 글, 다시 공개할 수 있습니다',
    excerpt: '공개에서 내려간 상태입니다. 지운 것이 아니라 보관입니다 — 관리자가 다시 공개할 수 있습니다.',
    thumb: 'ins-toss.jpg', source: 'own', author: '빌더 리아', date: '2026.08.17', readMin: 2,
    bodyHtml: '<h2 id="지우지-않는-이유">지우지 않는 이유</h2><p>지우면 작성자 연결과 이력이 함께 사라집니다. 상태를 삭제 플래그로 겸하지 않는 것도 같은 이유입니다.</p><h2 id="주소는-살아-있다">주소는 살아 있다</h2><p>보관된 글의 주소는 목록으로 301 됩니다(DR-08).</p>',
    status: 'archived', updated: '2026.08.17', owner: BUILDER_ME,
  },
]

/** 데모 글을 포함한 어드민 목록. 공개 화면은 절대 이 함수를 부르지 않는다 */
export function adminInsights(): AdminInsight[] {
  return [
    ...DEMO_INSIGHTS,
    ...ARTICLES.map(a => ({
      ...a,
      status: INSIGHT_STATUS[a.slug] ?? 'draft',
      updated: UPDATED[a.slug] ?? a.date,
      owner: INSIGHT_OWNER[a.slug] ?? ADMIN_ACCOUNT,
    })),
  ]
}

export function adminWorks(): AdminWork[] {
  return WORKS.map(w => {
    const leadSlug = w.builders[0]
    const lead = leadSlug ? builderBySlug(leadSlug) : undefined
    return {
      ...w,
      status: WORK_STATUS[w.slug] ?? 'draft',
      updated: UPDATED[w.slug] ?? `${w.year}.12.01`,
      leadName: lead?.name ?? '—',
      owner: leadSlug ?? ADMIN_ACCOUNT,
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
