/* 외부 서비스 연동 설정 — 값은 전부 환경변수에서 온다.
   소스에 계정값을 박아두면 팀원이 자기 계정으로 바꿀 때 코드를 고쳐야 하고,
   레포가 공개라 값이 그대로 따라 나간다. .env.local 에만 넣고 .env.example 로 형태만 공유한다.

   세 값 모두 비어 있어도 사이트는 그대로 동작한다 — 연동이 꺼진 상태가 정상 기본값이다.
   (Origin 시안에서 지킨 규칙과 같다: 키 없이도 화면이 죽지 않아야 한다) */

/* pluug 리드 폼. 문의 데이터는 우리 DB 에 저장하지 않고 pluug 가 받는다 (README §절대 규칙).
   www 를 붙인 정규 주소를 쓸 것 — pluuug.com/form/... 은 301 로 www 에 넘긴다. */
export const PLUUG_FORM_URL = process.env.NEXT_PUBLIC_PLUUG_FORM_URL ?? ''

/* 채널톡 플러그인 키. 채널톡 > 채널 설정 > 보안 및 개발 > 플러그인 키.
   ⚠ 잘못된 키를 넣으면 boot 콜백이 아예 오지 않는다 (에러도 없다 — Origin 에서 실측).
      키를 바꾼 뒤에는 반드시 런처를 눌러 메신저가 실제로 열리는지 확인할 것. */
export const CHANNEL_PLUGIN_KEY = process.env.NEXT_PUBLIC_CHANNEL_PLUGIN_KEY ?? ''

/* utm_source 는 "우리 사이트에서 왔다"는 뜻이라 고정값이다.
   방문자가 달고 들어온 utm_source 는 덮어쓰지 않고 entry_utm_source 로 따로 넘긴다 —
   둘은 질문이 다르다 (우리가 보낸 트래픽인가 vs 이 사람은 원래 어디서 왔나). */
const UTM_SOURCE = process.env.NEXT_PUBLIC_UTM_SOURCE ?? 'ai-builder-group'

/** 문의 폼 주소에 유입 정보를 붙여 돌려준다. 키가 없으면 빈 문자열. */
export function pluugUrl(section: string, refContent?: string): string {
  if (!PLUUG_FORM_URL) return ''
  let u: URL
  try {
    u = new URL(PLUUG_FORM_URL)
  } catch {
    return ''   /* 주소를 잘못 넣어도 페이지가 죽지는 않게 */
  }
  u.searchParams.set('utm_source', UTM_SOURCE)
  u.searchParams.set('utm_medium', 'website')
  u.searchParams.set('entry_section', section)          // 어느 CTA 가 전환을 만드는가
  if (refContent) u.searchParams.set('ref_content', refContent)
  if (typeof window !== 'undefined') {
    const inbound = new URLSearchParams(location.search).get('utm_source')
    if (inbound) u.searchParams.set('entry_utm_source', inbound)
  }
  return u.toString()
}

/* ── GA4 (TR-01 · IR-05) ────────────────────────────────────────────────
   측정 ID 는 **클라이언트 계정**에서 발급받은 값을 넣는다. 우리 계정을 만들지 않는다.
   비어 있으면 gtag.js 를 아예 싣지 않는다 — 채널톡·pluug 과 같은 규칙이다. */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''

/* ── UTM (TR-05 · TR-06) ────────────────────────────────────────────────
   TR-06 이 "UTM 은 단일 헬퍼 함수로 생성한다(수기 문자열 금지)"를 인수 조건으로 걸었다.
   실제로 홈 S8 에는 `utm_source=builder-group&utm_medium=content` 가 문자열로 박혀 있었고,
   그 값은 위 UTM_SOURCE(`ai-builder-group`)와도 달랐다 — 같은 사이트가 두 이름으로
   집계되고 있었다는 뜻이다. 그래서 생성 경로를 여기 하나로 모은다.

   ⚠ PRD §8.3 은 utm_source 를 `builder-group` 으로 적어 뒀지만, 실제 운영값은
     환경변수(NEXT_PUBLIC_UTM_SOURCE = ai-builder-group)이고 pluug 리드도 그 값으로
     쌓이는 중이다. 두 채널의 소스명이 갈리면 GA4 에서 한 사이트가 둘로 보인다.
     → 환경변수를 단일 원천으로 삼고, PRD 문구는 이관 문서에서 확인받는다. */
export type UtmMedium = 'content' | 'insight' | 'work' | 'website'

/** 노출 위치. PRD §8.3 의 utm_content 예시를 그대로 쓴다 */
export type UtmContent = 'hero_card' | 'list_item' | 'related' | 'featured' | 'channel_tab'

export function utmUrl(
  base: string,
  opts: { medium: UtmMedium; campaign: string; content?: UtmContent },
): string {
  let u: URL
  try {
    u = new URL(base)
  } catch {
    return base   /* 주소가 깨져 있어도 링크 자체는 살려 둔다 */
  }
  u.searchParams.set('utm_source', UTM_SOURCE)
  u.searchParams.set('utm_medium', opts.medium)
  u.searchParams.set('utm_campaign', opts.campaign)
  if (opts.content) u.searchParams.set('utm_content', opts.content)
  return u.toString()
}

/** 유튜브 영상 주소 + UTM. 영상 ID 만 데이터에 두고 주소는 여기서 만든다 (IR-08 — 수동 등록) */
export function youtubeWatchUrl(videoId: string, content?: UtmContent): string {
  return utmUrl(`https://www.youtube.com/watch?v=${videoId}`, {
    medium: 'content',
    campaign: videoId,
    content,
  })
}
