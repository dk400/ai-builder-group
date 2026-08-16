/* Insight 단일 원천.

   /insight 목록의 여덟 건은 파트너(똑똑한개발자) 아티클이고, 홈 S7 의 세 건은 우리 글이었다.
   두 묶음이 서로 다른 파일에 하드코딩돼 있어서 홈의 세 건은 목록에 아예 없었고, 카드가 전부
   /insight-detail 한 곳을 가리켰다. 여기 한 배열로 합치고 source 로 구분한다.

   슬러그 규칙 — 기획서 §4.2: `핵심 키워드 조합`. 첫 글의 슬러그는 기획서에 예시로 박힌 값
   (`바이브코딩-외주-고르는법`)을 그대로 쓴다.
   ⚠ 확정 후 바꾸면 색인이 소멸한다. 바꿔야 하면 next.config 의 redirects 에 301 을 함께 넣을 것.

   ⚠ 카테고리 슬러그 분기(`/insight/[category]`, 기획서 §4.3)는 아직 미확정(🟡)이라 넣지 않았다.
   넣을 때 `/insight/[slug]` 와 같은 세그먼트를 쓰므로 라우트를 하나 더 만들 수 없다 —
   [slug] 안에서 카테고리 슬러그를 먼저 조회하고, 없으면 아티클로 떨어뜨리는 방식이어야 한다.
   카테고리는 영문 소문자, 아티클은 한글이라 충돌하지 않는다.

   어드민 5단계에서 이 배열이 Supabase 쿼리로 바뀐다. bodyHtml 은 insights.body_html 컬럼과
   같은 모양이다 — 그때 서버에서 sanitize 한 값이 그대로 들어온다. */

export type InsightCategory = 'ai-ax' | 'guide' | 'how' | 'project'

export type Article = {
  slug: string
  cat: InsightCategory
  title: string
  excerpt: string
  thumb: string
  /** 'own' = 우리 글(홈 S7 노출) · 'partner' = 똑똑한개발자 아티클 공동 발행 */
  source: 'own' | 'partner'
  author: string
  /** YYYY.MM.DD — 최신순 정렬 키 */
  date: string
  /** 본문. 없으면 상세 페이지가 준비 중 안내를 띄운다 */
  bodyHtml?: string
  readMin?: number
}

export const CATEGORY_LABEL: Record<InsightCategory, string> = {
  'ai-ax': 'AI · AX',
  guide: '발주 가이드',
  how: '일하는 방식',
  project: '프로젝트',
}

/* 유일하게 본문이 있는 글. 나머지는 어드민(5단계)에서 채운다.
   h1 은 페이지 제목이 쓰므로 본문은 h2 부터 시작한다 — FR-A03-02 와 같은 규칙이다. */
const BODY_VIBE_CODING = `
<p>&quot;바이브 코딩으로 외주해 드립니다&quot;라는 업체가 빠르게 늘고 있습니다. 같은 도구를 쓴다고 같은 결과가 나오지 않는데도, 밖에서 보면 구분이 어렵습니다. 이 글은 발주하는 입장에서 그 차이를 가려내는 기준을 정리한 것입니다.</p>

<h2 id="t1">첫째, 포트폴리오의 &apos;실체&apos;를 물어보세요</h2>
<p>포트폴리오 개수가 많다고 실적이 많은 것이 아닙니다. 실제로 존재하지 않는 프로젝트를 산업별 목업으로 만들어두는 업체가 있습니다. 확인 방법은 간단합니다 — &quot;이 프로젝트, 실제 서비스 URL을 알려주실 수 있나요?&quot;라고 물어보면 됩니다.</p>
<blockquote>실제로 수행한 프로젝트라면, 보여주지 못할 이유가 없습니다.</blockquote>

<h2 id="t2">둘째, 사이트의 만듦새를 보세요</h2>
<p>그 업체의 자체 사이트를 열어보세요. 모든 섹션이 똑같은 방식으로 움직인다면 — 모든 텍스트가 동일하게 아래에서 위로 떠오르기만 한다면 — 그것은 AI로 한 번에 생성하고 손보지 않았다는 신호입니다. 자기 사이트에 시간을 쓰지 않는 팀이 고객 사이트에 시간을 쓸 가능성은 낮습니다.</p>

<div class="yt" data-track="youtube_outbound" data-slug="quality-video"><div class="play"><i>▶</i></div></div>
<p class="yt-link"><a href="/content">유튜브에서 보기 →</a></p>

<h2 id="t3">셋째, 가격이 아니라 구조를 물어보세요</h2>
<p>&quot;반값&quot;을 앞세우는 곳은 조심해야 합니다. 물어야 할 것은 가격이 아니라 구조입니다 — 누가 만드는지, 어떻게 검증된 사람인지, 진행 중에 무엇을 확인시켜 주는지, 끝나면 무엇을 넘겨주는지. 이 네 가지에 명확히 답하는 팀이라면 도구가 무엇이든 결과물이 나옵니다.</p>

<div class="tags"><span class="tag">발주 가이드</span><span class="tag">외주</span><span class="tag">체크리스트</span></div>
`.trim()

export const ARTICLES: Article[] = [
  /* ── 우리 글 ── */
  {
    slug: '바이브코딩-외주-고르는법',
    cat: 'guide', title: '바이브 코딩 외주, 잘하는 곳과 못하는 곳의 차이',
    excerpt: '같은 도구를 써도 결과가 다릅니다. 발주 전에 가려내는 기준 세 가지.',
    thumb: 'ins-turnkey.jpg', source: 'own', author: '운영팀', date: '2026.08.11',
    bodyHtml: BODY_VIBE_CODING, readMin: 4,
  },
  {
    slug: '3주-랜딩페이지-제작순서',
    cat: 'how', title: '우리가 3주 만에 랜딩 페이지를 만드는 순서',
    excerpt: '기획·디자인·개발을 한 사람이 맡으면 일정이 어떻게 접히는지.',
    thumb: 'ins-native.jpg', source: 'own', author: '운영팀', date: '2026.08.09',
  },
  {
    slug: 'ai툴-실무도입-검증기준',
    cat: 'ai-ax', title: '새 AI 툴을 실무에 붙일 때 우리가 확인하는 것들',
    excerpt: '도구가 매주 바뀝니다. 붙일지 말지를 가르는 우리 기준을 공개합니다.',
    thumb: 'ins-poc.jpg', source: 'own', author: '운영팀', date: '2026.08.07',
  },

  /* ── 파트너 아티클 ── */
  {
    slug: 'ai-poc-도입전-검증',
    cat: 'ai-ax', title: "AI PoC란? 기업 AI 도입 전 반드시 필요한 'PoC' 알아보기",
    excerpt: '기업 AI 도입, 전면 구축 전에 PoC로 먼저 검증해야 하는 이유.',
    thumb: 'ins-poc.jpg', source: 'partner', author: '똑똑한개발자', date: '2026.08.03',
  },
  {
    slug: 'ai에이전트-도입-체크리스트',
    cat: 'ai-ax', title: '우리 회사에도 AI 에이전트가 필요할까? 5분 체크리스트',
    excerpt: '도입이 필요한 조직의 신호 — 5분 만에 자가진단해 보세요.',
    thumb: 'ins-agent.jpg', source: 'partner', author: '똑똑한개발자', date: '2026.07.22',
  },
  {
    slug: 'ai도입-ax-차이-업무설계',
    cat: 'ai-ax', title: 'AI 도입과 AX는 다르다 — 성과를 만드는 업무 설계 3가지',
    excerpt: '도입했는데 성과가 없다면, AX와의 결정적 차이를 봐야 합니다.',
    thumb: 'ins-ax.jpg', source: 'partner', author: '똑똑한개발자', date: '2026.07.16',
  },
  {
    slug: '기업ai-도입-거버넌스',
    cat: 'ai-ax', title: '기업용 AI 도입, 왜 거버넌스가 먼저 필요할까?',
    excerpt: '데이터 유출·통제 불능을 막는 AI 거버넌스 설계법.',
    thumb: 'ins-gov.jpg', source: 'partner', author: '똑똑한개발자', date: '2026.07.14',
  },
  {
    slug: '개발외주-견적-비교법',
    cat: 'guide', title: '500만 원 vs 2,000만 원, 개발 외주 견적 비교 제대로 하는 법',
    excerpt: '같은 앱인데 견적이 4배 차이 나는 이유를 뜯어봅니다.',
    thumb: 'ins-quote.jpg', source: 'partner', author: '똑똑한개발자', date: '2026.07.03',
  },
  {
    slug: '외주개발-턴키팀-이유',
    cat: 'guide', title: '외주개발, 왜 올인원 턴키 팀과 함께 해야 할까?',
    excerpt: '기획·디자인·개발을 따로 맡기면 실패하는 구조적 이유.',
    thumb: 'ins-turnkey.jpg', source: 'partner', author: '똑똑한개발자', date: '2026.07.03',
  },
  {
    slug: '토스-미니게임-프로젝트',
    cat: 'project', title: '토스 안에서 미니게임을? 똑똑한개발자 × 앱인토스',
    excerpt: '토스와 함께 미니게임을 만든 프로젝트 비하인드.',
    thumb: 'ins-toss.jpg', source: 'partner', author: '똑똑한개발자', date: '2026.07.03',
  },
  {
    slug: 'ai네이티브-에이전시-운영법',
    cat: 'how', title: '기획·디자인·개발을 하나로 — AI 네이티브 에이전시 운영법',
    excerpt: "'프로덕트 빌더'로 팀을 운영하는 방식, 빌더 조쉬와의 대화.",
    thumb: 'ins-native.jpg', source: 'partner', author: '똑똑한개발자', date: '2026.04.22',
  },
]

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug)
}

/* 최신순. 배열에 손으로 적은 순서를 믿지 않는다 — 홈 S7 은 최신 3건을 노출해야 하고
   (FR-P01-04), 글이 늘 때마다 순서를 다시 맞추는 일은 반드시 한 번 빠진다.
   날짜가 YYYY.MM.DD 고정폭이라 문자열 비교로 정렬해도 결과가 같다. */
export function latestArticles(n = ARTICLES.length): Article[] {
  return [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n)
}

/** 카테고리별 건수. 목록 상단 칩의 숫자가 손으로 적혀 있어 글이 늘면 어긋났다 */
export function countByCategory(cat: InsightCategory | 'all'): number {
  return cat === 'all' ? ARTICLES.length : ARTICLES.filter(a => a.cat === cat).length
}

/** 두 자리 고정 — '( 8 )' 이 아니라 '( 08 )' 로 읽혀야 옆 숫자와 자리가 맞는다 */
export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** 본문에서 h2 를 뽑아 목차를 만든다. 5단계에서 DB 본문이 들어와도 그대로 동작한다 */
export function tocOf(bodyHtml: string): Array<{ id: string; text: string }> {
  const out: Array<{ id: string; text: string }> = []
  const re = /<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(bodyHtml)) !== null) {
    const id = m[1]
    const raw = m[2]
    if (!id || raw === undefined) continue
    const text = raw.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&apos;/g, "'").trim()
    out.push({ id, text })
  }
  return out
}
