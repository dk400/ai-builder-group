/* 빌더 단일 원천.

   /work 의 빌더 그리드와 /builder 의 프로필이 같은 열 명을 각자 적고 있었다. 이름·역할·수행
   건수는 글자까지 같았고, 참여 프로젝트는 /builder 쪽에만 있어서 프로젝트에서 빌더를 거꾸로
   찾을 방법이 없었다. 이제 참여 관계는 WORKS 의 builders 한쪽에만 두고 여기서는 조회만 한다.

   어드민 8단계(A-06)에서 이 배열이 Supabase builders 테이블로 바뀐다. 필드를 그 컬럼에 맞춰
   두었다 — slug · name · role · avatar_url · is_active. */

export type BuilderLevel = 'lead' | 'new' | 'builder'

export type Builder = {
  slug: string
  /** 시트 번호. 프로필 상단·사이드 두 곳에 같은 값이 나간다 */
  no: string
  name: string
  /** 이름만. '조쉬의 작업물' 처럼 조사가 붙는 자리에 쓴다 */
  fname: string
  role: string
  avatar: string
  /** 카드 한 줄 소개 (/work 그리드) */
  blurb: string
  /** 프로필 본문 (/builder) */
  bio: string
  focus: string
  /** 카드에는 앞 두 개만 노출된다 */
  stack: string[]
  done: number
  level: BuilderLevel
  levelLabel: string
  /** 그리드 등장 순서용 딜레이 클래스. 순번과 무관하게 손으로 맞춰 둔 값이라 그대로 옮긴다 */
  box: string
  principles: Array<[string, string]>
  extra: { label: string; href: string } | null
}

export const BUILDERS: Builder[] = [
  {
    slug: 'josh', no: 'B—001', name: '빌더 조쉬', fname: '조쉬',
    role: '프로덕트 빌더 · 기획+개발', avatar: '/assets/img/av-josh.jpg',
    blurb: '기획자·디자이너·개발자를 합친 원맨 프로덕트 빌더. AI 네이티브 운영법 인터뷰의 그 사람.',
    bio: '기획자·디자이너·개발자를 합친 원맨 프로덕트 빌더입니다. 요구사항 정리부터 배포까지 한 사람이 끝까지 책임지는 방식으로 일하며, 전달 과정에서 생기는 손실을 없애는 것이 강점입니다. AI 네이티브 운영법 인터뷰의 그 사람.',
    focus: '프로덕트 전체 · MVP · 검증', stack: ['Next.js', 'LLM API', 'Supabase'], done: 14,
    level: 'lead', levelLabel: '✳ 이달의 빌더', box: 'bcard rv',
    principles: [
      ['한 사람이 끝까지', '기획·디자인·개발이 한 머리에서 나옵니다. 전달 손실이 없고, 의사결정이 빠릅니다.'],
      ['말보다 화면', '요구사항은 문서 대신 동작하는 화면으로 정리합니다. 첫 미팅에서 러프 목업을 함께 봅니다.'],
      ['AI 네이티브', '반복 작업은 에이전트에 맡기고, 사람의 시간은 판단에 씁니다.'],
    ],
    extra: { label: 'AI 네이티브 운영법 인터뷰 보기', href: '/insight/ai네이티브-에이전시-운영법' },
  },
  {
    slug: 'ria', no: 'B—002', name: '빌더 리아', fname: '리아',
    role: '랜딩 · 인터랙션', avatar: '/assets/img/av-ria.jpg',
    blurb: '디자인 감도와 전환 설계가 강점. 수주용 랜딩과 브랜드 사이트를 주로 맡습니다.',
    bio: '디자인 감도와 전환 설계가 강점인 빌더입니다. 수주용 랜딩과 브랜드 사이트를 주로 맡으며, 화면의 인상보다 화면이 만들어내는 행동을 먼저 설계합니다.',
    focus: '수주용 랜딩 · 브랜드 사이트', stack: ['Interaction', 'GA4 설계'], done: 9,
    level: 'builder', levelLabel: 'Builder', box: 'bcard rv d1',
    principles: [
      ['전환에서 역산', '예쁜 화면이 아니라 문의가 생기는 화면을 설계합니다. CTA 동선부터 그립니다.'],
      ['인터랙션은 근거 위에', '움직임 하나에도 시선 흐름의 이유를 답니다. 과한 모션은 뺍니다.'],
      ['측정 가능한 디자인', 'GA4 이벤트 설계까지 랜딩의 일부로 봅니다. 열어보고 고칠 수 있게 만듭니다.'],
    ],
    extra: null,
  },
  {
    slug: 'dohyun', no: 'B—003', name: '빌더 도현', fname: '도현',
    role: '플랫폼 · 어드민', avatar: '/assets/img/av-dohyun.jpg',
    blurb: '데이터 모델링과 권한 설계 경험 다수. 관리자·정산 시스템을 안정적으로 짓습니다.',
    bio: '데이터 모델링과 권한 설계 경험이 많은 빌더입니다. 관리자·정산처럼 틀리면 안 되는 시스템을 안정적으로 짓는 것이 전문입니다.',
    focus: '어드민 · 정산 · 권한 설계', stack: ['Supabase', 'RBAC'], done: 11,
    level: 'builder', levelLabel: 'Builder', box: 'bcard rv d2',
    principles: [
      ['데이터 모델이 먼저', '화면보다 테이블을 먼저 그립니다. 구조가 맞으면 화면은 따라옵니다.'],
      ['권한은 처음부터', 'RBAC는 나중에 붙이면 늦습니다. 설계 단계에서 역할과 경계를 확정합니다.'],
      ['운영자도 사용자', '어드민을 쓰는 운영자의 하루를 기준으로 화면을 짭니다.'],
    ],
    extra: null,
  },
  {
    slug: 'yuna', no: 'B—004', name: '빌더 유나', fname: '유나',
    role: 'AI 서비스 · 에이전트', avatar: '/assets/img/av-yuna.jpg',
    blurb: 'LLM 연동·프롬프트 설계를 실무로 다룹니다. PoC부터 단계 검증으로 리스크를 줄입니다.',
    bio: 'LLM 연동과 프롬프트 설계를 실무로 다루는 빌더입니다. 전면 도입 대신 PoC부터 단계 검증으로 리스크를 줄이며 AI 서비스를 만듭니다.',
    focus: 'LLM 연동 · 에이전트 · PoC', stack: ['Agents', 'RAG'], done: 7,
    level: 'builder', levelLabel: 'Builder', box: 'bcard rv d3',
    principles: [
      ['PoC로 먼저 증명', '전면 도입 전에 실데이터로 작게 검증합니다. 판단 근거를 만드는 것이 먼저입니다.'],
      ['AI의 경계를 정직하게', 'AI가 잘하는 범위를 긋고, 나머지는 사람에게 넘기는 구조로 설계합니다.'],
      ['프롬프트도 코드처럼', '버전 관리와 평가 없이 배포하지 않습니다.'],
    ],
    extra: null,
  },
  {
    slug: 'hajun', no: 'B—005', name: '빌더 하준', fname: '하준',
    role: '모바일 앱 · 크로스플랫폼', avatar: '/assets/img/av-hajun.jpg',
    blurb: '하나의 코드베이스로 iOS·Android를 함께 짓습니다. 스토어 심사·배포까지 책임집니다.',
    bio: '하나의 코드베이스로 iOS·Android를 함께 짓는 모바일 빌더입니다. 개발에서 끝내지 않고 스토어 심사와 배포, 출시 후 크래시 대응까지를 프로젝트의 범위로 봅니다.',
    focus: '모바일 앱 · 스토어 출시', stack: ['Flutter', '스토어 배포'], done: 6,
    level: 'builder', levelLabel: 'Builder', box: 'bcard rv',
    principles: [
      ['한 코드베이스, 두 플랫폼', 'iOS와 Android를 따로 만들지 않습니다. 유지보수 비용을 절반으로 줄입니다.'],
      ['심사까지가 개발', '스토어 리젝은 일정의 리스크입니다. 심사 기준을 설계 단계에서 반영합니다.'],
      ['출시가 시작', '크래시 리포트와 스토어 리뷰를 보며 출시 후 첫 2주를 함께 지킵니다.'],
    ],
    extra: null,
  },
  {
    slug: 'sein', no: 'B—006', name: '빌더 세인', fname: '세인',
    role: '데이터 · 업무 자동화', avatar: '/assets/img/av-sein.jpg',
    blurb: '반복되는 손작업을 파이프라인과 에이전트로 바꿉니다. 데이터가 흐르게 만드는 빌더.',
    bio: '반복되는 손작업을 파이프라인과 에이전트로 바꾸는 빌더입니다. 흩어진 스프레드시트와 수작업 보고를 자동으로 흐르는 데이터로 만들어, 사람이 판단에만 집중하게 합니다.',
    focus: '데이터 파이프라인 · 자동화', stack: ['Python', 'n8n'], done: 5,
    level: 'builder', levelLabel: 'Builder', box: 'bcard rv d1',
    principles: [
      ['손이 가면 자동화 대상', '주 1회 이상 반복되는 작업은 전부 자동화 후보로 올립니다.'],
      ['대시보드보다 알림', '들어가서 봐야 하는 화면보다, 필요할 때 찾아오는 알림을 먼저 만듭니다.'],
      ['깨져도 티가 나게', '조용히 틀리는 자동화가 최악입니다. 실패는 반드시 드러나게 설계합니다.'],
    ],
    extra: null,
  },
  {
    slug: 'minseo', no: 'B—007', name: '빌더 민서', fname: '민서',
    role: '브랜드 · 모션 디자인', avatar: '/assets/img/av-minseo.jpg',
    blurb: '디자인 시스템과 모션으로 서비스의 인상을 만듭니다. 개발자가 바로 쓸 수 있는 디자인.',
    bio: '디자인 시스템과 모션으로 서비스의 인상을 만드는 빌더입니다. 한 장의 예쁜 시안이 아니라, 개발자가 바로 가져다 쓸 수 있는 컴포넌트와 토큰으로 디자인을 전달합니다.',
    focus: '디자인 시스템 · 모션', stack: ['Design System', 'Motion'], done: 4,
    level: 'builder', levelLabel: 'Builder', box: 'bcard rv d2',
    principles: [
      ['브랜드는 시스템으로', '색·타이포·컴포넌트를 토큰으로 정의해 어디서든 같은 인상을 냅니다.'],
      ['모션에도 목적', '움직임은 장식이 아니라 안내입니다. 목적 없는 모션은 뺍니다.'],
      ['개발자가 쓸 수 있게', '시안이 아니라 스펙으로 전달합니다. 디자인과 구현의 간극을 없앱니다.'],
    ],
    extra: null,
  },
  {
    slug: 'taeo', no: 'B—008', name: '빌더 태오', fname: '태오',
    role: '커머스 · 결제', avatar: '/assets/img/av-taeo.jpg',
    blurb: 'PG·정기결제 연동과 주문·정산 흐름 설계가 전문. 돈이 오가는 화면을 꼼꼼하게 짓습니다.',
    bio: 'PG·정기결제 연동과 주문·정산 흐름 설계가 전문인 빌더입니다. 돈이 오가는 화면일수록 예외 케이스가 많다는 것을 알고, 그 예외부터 설계합니다.',
    focus: '결제 연동 · 주문·정산', stack: ['PG 연동', '구독 결제'], done: 8,
    level: 'new', levelLabel: 'NEW', box: 'bcard rv d2',
    principles: [
      ['예외부터 설계', '결제는 성공보다 실패·취소·환불이 어렵습니다. 예외 흐름을 먼저 그립니다.'],
      ['정산은 맞아떨어지게', '1원 차이도 운영 비용입니다. 주문·결제·정산 데이터가 항상 맞물리게 짓습니다.'],
      ['테스트 결제까지 끝까지', '실 카드 승인·취소 시나리오를 검증하고 나서야 출시라고 부릅니다.'],
    ],
    extra: null,
  },
  {
    slug: 'eunchae', no: 'B—009', name: '빌더 은채', fname: '은채',
    role: '그로스 · SEO', avatar: '/assets/img/av-eunchae.jpg',
    blurb: '검색 유입과 콘텐츠 구조를 설계합니다. 만든 뒤에 발견되게 하는 것까지가 일입니다.',
    bio: '검색 유입과 콘텐츠 구조를 설계하는 빌더입니다. 잘 만든 서비스가 발견되지 않는 것이 가장 아까운 일이라, 만든 뒤에 발견되게 하는 것까지를 일로 봅니다.',
    focus: '검색 유입 · 콘텐츠 구조', stack: ['SEO', 'Analytics'], done: 5,
    level: 'new', levelLabel: 'NEW', box: 'bcard rv d3',
    principles: [
      ['구조가 곧 SEO', '키워드보다 정보 구조가 먼저입니다. 검색엔진도 사람처럼 읽기 쉬운 사이트를 좋아합니다.'],
      ['측정 없이 개선 없음', '유입·전환 데이터를 먼저 깔고, 숫자가 말해주는 순서로 고칩니다.'],
      ['콘텐츠는 자산으로', '한 번 쓰고 버리는 글이 아니라 계속 유입을 만드는 구조로 쌓습니다.'],
    ],
    extra: null,
  },
  {
    slug: 'junho', no: 'B—010', name: '빌더 준호', fname: '준호',
    role: '운영 · 인프라', avatar: '/assets/img/av-junho.jpg',
    blurb: '배포 자동화와 모니터링으로 서비스를 지킵니다. 출시 후에도 문제가 먼저 보이게.',
    bio: '배포 자동화와 모니터링으로 서비스를 지키는 빌더입니다. 출시가 끝이 아니라 시작이라는 것을 알기에, 문제가 고객보다 팀에게 먼저 보이게 만듭니다.',
    focus: '배포 자동화 · 모니터링', stack: ['CI/CD', '모니터링'], done: 3,
    level: 'new', levelLabel: 'NEW', box: 'bcard rv d4',
    principles: [
      ['배포는 버튼 하나로', '사람 손을 타는 배포는 사고의 씨앗입니다. 반복 가능한 파이프라인으로 만듭니다.'],
      ['고객보다 먼저 알기', '장애는 알림으로 먼저 만납니다. 조용히 죽는 서버가 없게 감시를 깔아둡니다.'],
      ['되돌릴 수 있게', '모든 배포는 롤백 계획과 함께 나갑니다. 되돌릴 수 없는 변경은 하지 않습니다.'],
    ],
    extra: null,
  },
]

/* 전문 분야 — 그룹이 수주하는 영역의 목록이다.

   빌더 카드 · 프로젝트 크레딧 · 매칭 결과에 그대로 나가는 값이라 자유 입력으로 두면
   "랜딩·인터랙션" 과 "랜딩 / 인터랙션" 이 섞여 목록이 지저분해진다. 어드민에서는 이 목록에서
   고르게 하고, 여기 없는 영역이 생기면 '기타'로 직접 적는다.

   ⚠ 순서는 화면 노출 순서다. 늘릴 때는 /work 의 매칭 위저드(landing · platform · ai · app)가
   어느 항목으로 이어지는지 함께 확인할 것. */
export const SPECIALTIES = [
  '프로덕트 빌더 · 기획+개발',
  '랜딩 · 인터랙션',
  '플랫폼 · 어드민',
  'AI 서비스 · 에이전트',
  '모바일 앱 · 크로스플랫폼',
  '데이터 · 업무 자동화',
  '브랜드 · 모션 디자인',
  '커머스 · 결제',
  '그로스 · SEO',
  '운영 · 인프라',
] as const

/* 주로 맡는 일 — 전문 분야보다 한 단계 구체적인 표기다.
   빌더 프로필의 Builder Sheet 한 줄에 그대로 들어간다. */
export const FOCUS_AREAS = [
  '프로덕트 전체 · MVP · 검증',
  '수주용 랜딩 · 브랜드 사이트',
  '어드민 · 정산 · 권한 설계',
  'LLM 연동 · 에이전트 · PoC',
  '모바일 앱 · 스토어 출시',
  '데이터 파이프라인 · 자동화',
  '디자인 시스템 · 모션',
  '결제 연동 · 주문·정산',
  '검색 유입 · 콘텐츠 구조',
  '배포 자동화 · 모니터링',
] as const

/* 주요 스택 — 고를 수 있는 기술 목록.

   자유 입력이면 'Next.js' 와 'NextJS' 와 '넥스트' 가 섞인다. 빌더 카드의 칩과 프로필의
   '주요 스택' 줄에 그대로 나가는 값이라 표기가 흔들리면 바로 보인다.
   ⚠ 순서가 의미를 갖는다 — 카드에는 앞의 두 개만 나온다 (work/view.tsx 의 stack.slice(0,2)). */
export const STACKS = [
  'Next.js', 'React Native', 'Flutter', 'Python', 'Supabase', 'RBAC',
  'LLM API', 'Agents', 'RAG', 'n8n',
  'Design System', 'Motion', 'Interaction',
  'PG 연동', '구독 결제',
  'GA4 설계', 'SEO', 'Analytics',
  'CI/CD', '모니터링', '스토어 배포',
] as const

export function builderBySlug(slug: string): Builder | undefined {
  return BUILDERS.find(b => b.slug === slug)
}

/** 뱃지는 lead·new 만 단다. 나머지는 카드에 아무것도 얹지 않는다 */
export function badgeOf(b: Builder): { cls: string; label: string } | null {
  if (b.level === 'lead') return { cls: 'lv lv--lead', label: b.levelLabel }
  if (b.level === 'new') return { cls: 'lv lv--new', label: b.levelLabel }
  return null
}
