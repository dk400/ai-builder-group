/* Work 단일 원천.

   여태 같은 프로젝트가 세 곳에 따로 적혀 있었다 — /work 의 PROJECTS, /builder 의 PROJECTS,
   그리고 홈 S6 의 하드코딩 카드 세 장. 홈 카드는 아예 다른 프로젝트였고, 나머지 두 곳은
   같은 iloom 인데 설명 문장이 서로 달랐다. 그리고 아홉 장이 전부 /work-detail 한 곳을 가리켰다.

   슬러그 규칙 — 기획서 §4.2
   · `업종·기술 + 프로젝트명`, 한글 자연어 유지
   · **고객사명 제외** (§14 Q7 — NDA·공개 동의 확인 전까지. 동의 확인된 건만 사후 추가)
   · 프로젝트명 단독 금지 (검색되지 않는다)
   ⚠ 확정 후 바꾸면 색인이 소멸한다. 바꿔야 하면 next.config 의 redirects 에 301 을 함께 넣을 것.

   어드민 3단계에서 이 배열이 Supabase 쿼리로 바뀐다. 소비 측은 WORKS·workBySlug 만 보므로
   그때 이 파일 하나만 갈아끼우면 된다. 필드 이름을 works 테이블 컬럼에 맞춰 둔 이유다. */

import { builderBySlug } from './_builders'

export type WorkCategory = 'aiax' | 'commerce' | 'platform' | 'finance'

export type Work = {
  slug: string
  title: string
  /** 목록 필터 키. 칩의 data-cat 과 카드의 data-c 가 이 값으로 맞물린다 */
  cat: WorkCategory
  /** 카드에 노출되는 분야 라벨. cat 보다 세분화돼 있다 (platform ⊃ O2O · SaaS · Platform) */
  tag: string
  year: string
  summary: string
  cover: string
  coverAlt: string
  /** 똑똑한개발자와 공동 수행한 건 */
  withPartner: boolean
  /** 참여 빌더 슬러그. 첫 번째가 리드 — 카드에는 리드만 표기한다 */
  builders: string[]
}

export const WORKS: Work[] = [
  {
    slug: '커머스-리빙-리뉴얼',
    title: 'iloom — 리빙 커머스 리뉴얼',
    cat: 'commerce', tag: 'Commerce', year: '2026',
    summary: '가구 브랜드 일룸의 커머스 경험 개편. 상품 탐색부터 상담 전환까지 여정 재설계.',
    cover: 'work-iloom.png', coverAlt: 'iloom 리빙 커머스 화면',
    withPartner: true, builders: ['josh', 'minseo', 'taeo'],
  },
  {
    slug: 'ai-업무플랫폼-daisy',
    title: 'DAISY — 대홍기획',
    cat: 'aiax', tag: 'AI · AX', year: '2026',
    summary: '광고 그룹의 AI 업무 플랫폼 구축.',
    cover: 'work-daisy.png', coverAlt: 'DAISY AI 업무 플랫폼 화면',
    withPartner: true, builders: ['yuna', 'sein'],
  },
  {
    slug: 'o2o-예약-사용자앱',
    title: 'Aerok User — 사용자 앱',
    cat: 'platform', tag: 'O2O', year: '2025',
    summary: '예약·이용 플로우 전면 구축.',
    cover: 'work-aerok-user.jpg', coverAlt: 'Aerok 사용자 앱 화면',
    withPartner: false, builders: ['ria', 'hajun'],
  },
  {
    slug: '핀테크-결제-어드민',
    title: 'NICE 정보통신 — 결제 인프라 어드민',
    cat: 'finance', tag: 'Finance', year: '2025',
    summary: '결제 데이터 대시보드와 운영 콘솔. 금융 수준 권한·감사 로그 설계 포함.',
    cover: 'work-nice.png', coverAlt: 'NICE 정보통신 결제 어드민 화면',
    withPartner: true, builders: ['dohyun', 'sein', 'junho'],
  },
  {
    slug: 'saas-지점정산-운영콘솔',
    title: 'Aerok Admin — 운영 콘솔',
    cat: 'platform', tag: 'SaaS · Admin', year: '2025',
    summary: '지점·정산 통합 관리 시스템.',
    cover: 'work-aerok-admin.jpg', coverAlt: 'Aerok 운영 콘솔 화면',
    withPartner: false, builders: ['dohyun', 'junho'],
  },
  {
    slug: '미디어-광고-셀프집행',
    title: 'Btv 우리동네광고 — SK브로드밴드',
    cat: 'commerce', tag: 'Media', year: '2024',
    summary: '소상공인 TV 광고 셀프 집행 플랫폼.',
    cover: 'work-btv.png', coverAlt: 'Btv 우리동네광고 화면',
    withPartner: true, builders: ['josh', 'eunchae'],
  },
  {
    slug: '커머스-복지몰-edk',
    title: '마크스폰 EDK',
    cat: 'platform', tag: 'SaaS · Admin', year: '2025',
    summary: '기업 복지 커머스 운영 시스템.',
    cover: 'work-markspon.png', coverAlt: '마크스폰 EDK 화면',
    withPartner: false, builders: ['dohyun', 'taeo'],
  },
  {
    slug: 'ai-심리분석-canape',
    title: 'CANAPE — 도다마인드',
    cat: 'aiax', tag: 'AI · AX', year: '2023',
    summary: 'AI 심리 분석 서비스.',
    cover: 'work-canape.png', coverAlt: 'CANAPE AI 심리 분석 서비스 화면',
    withPartner: false, builders: ['yuna', 'minseo'],
  },
  {
    slug: '플랫폼-돌봄-연결',
    title: '패밀리케어 — 키즈노트',
    cat: 'platform', tag: 'Platform', year: '2022',
    summary: '가족 돌봄 연결 서비스.',
    cover: 'work-familycare.jpg', coverAlt: '키즈노트 패밀리케어 화면',
    withPartner: false, builders: ['ria', 'hajun'],
  },
]

export function workBySlug(slug: string): Work | undefined {
  return WORKS.find(w => w.slug === slug)
}

/* 카드 크레딧 한 줄 — 'with 똑똑한개발자 · 빌더 조쉬'.
   전에는 이 문자열이 카드마다 손으로 적혀 있어서, 어떤 카드는 설명 문장 끝에 '· 빌더 유나' 가
   붙고 어떤 카드는 별도 칩 줄로 나갔다. 아홉 장의 형태가 같아야 목록으로 읽힌다. */
export function creditOf(w: Work): string {
  const leadSlug = w.builders[0]
  const lead = leadSlug ? builderBySlug(leadSlug) : undefined
  return [w.withPartner ? 'with 똑똑한개발자' : null, lead?.name].filter(Boolean).join(' · ')
}

/** 특정 빌더가 참여한 프로젝트. /builder 의 작업물 그리드가 쓴다 */
export function worksByBuilder(builderSlug: string): Work[] {
  return WORKS.filter(w => w.builders.includes(builderSlug))
}
