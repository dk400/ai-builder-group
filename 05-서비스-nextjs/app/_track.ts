/* 계측 공통 래퍼 — PRD §8 (TR-01 ~ TR-06)

   TR-03 이 "이벤트 발화는 공통 래퍼를 통해서만 한다(개별 호출 산재 금지)"를 인수 조건으로
   걸었다. 그래서 gtag 를 직접 부르는 곳은 이 파일 하나다.

   ⚠ 예전 스텁(`window.track = console.log`)은 SiteFx 의 useEffect 안에서 정의됐다.
      React 는 형제 컴포넌트의 effect 를 트리 순서대로 실행하는데, layout 에서 {children} 이
      SiteFx 보다 먼저 오므로 **상세 페이지의 첫 진입 이벤트가 래퍼보다 먼저 발화**했다.
      work_detail_view · insight_detail_view 가 첫 로드에서 통째로 유실되고 있었다는 뜻이다.
      그래서 래퍼를 컴포넌트가 아니라 모듈 최상단에 둔다 — import 되는 순간 준비된다.

   gtag.js 가 아직 안 실려도 dataLayer 에 밀어 넣으면 라이브러리가 로드될 때 한꺼번에
   처리된다. 구글 공식 스니펫이 하는 일이 정확히 이것이다. */

import { GA_MEASUREMENT_ID } from './_integrations'

declare global {
  interface Window {
    dataLayer?: IArguments[]
    gtag?: (...args: unknown[]) => void
    /** 마크업(`[data-track]`)에서 부르는 통로. 실제 구현은 아래 track() 하나다 */
    track?: (name: TrackEvent, params?: TrackParams) => void
  }
}

/* PRD §8.2 이벤트 규약 7종.
   여기에 없는 이름은 타입이 막는다 — "규약에 없는 이벤트가 슬쩍 늘어나는 것"이
   측정 설계가 무너지는 첫 단계다. 늘려야 하면 PRD 를 먼저 고친다. */
export type TrackEvent =
  | 'page_view'            // 전 페이지 (Analytics 가 라우트 전환마다 발화)
  | 'cta_click'            // 문의 CTA — location
  | 'work_detail_view'     // P-03 진입 — slug · category
  | 'insight_detail_view'  // P-05 진입 — slug · category · author_type
  | 'youtube_outbound'     // P-06 → 유튜브 — video_id · utm_campaign
  | 'faq_topic_change'     // P-07 토픽 전환 — topic
  | 'contact_submit'       // ★ P-09 도달 — 전환 지표
  /* ── 규약 밖 확장 3종. 인수 조건(7종)과 구분해 두려고 아래에 모아 둔다 ── */
  | 'youtube_channel_click' // 채널 구독 배너 (영상이 아니라 채널이라 video_id 가 없다)
  | 'builder_click'         // Work → 빌더 프로필
  | 'chat_start'            // 채널톡 대화 시작

export type TrackParams = Record<string, string | number | boolean | undefined>

let configured = false

function bootstrap(): void {
  if (typeof window === 'undefined') return
  if (!window.dataLayer) window.dataLayer = []
  if (!window.gtag) {
    window.gtag = function gtag() {
      /* GA4 는 배열이 아니라 arguments 객체를 그대로 받아야 한다 */
      window.dataLayer!.push(arguments)
    }
  }
  /* config 도 여기서 넣는다. gtag 는 큐를 **들어온 순서대로** 처리하므로 config 보다
     먼저 들어간 이벤트는 측정 ID 를 못 만나고 사라진다. 모든 발화가 bootstrap() 을
     먼저 지나가게 해서 순서를 보장한다. */
  if (!configured && GA_MEASUREMENT_ID) {
    configured = true
    window.gtag!('js', new Date())
    /* 자동 page_view 는 끈다 — App Router 의 클라이언트 전환을 잡지 못해 첫 진입 한 번만
       집계된다. 라우트마다 Analytics 가 직접 쏜다. */
    window.gtag!('config', GA_MEASUREMENT_ID, { send_page_view: false })
  }
}

bootstrap()

/** 이벤트 하나를 GA4 로 보낸다. 측정 ID 가 없으면 개발 콘솔에만 남는다. */
export function track(name: TrackEvent, params: TrackParams = {}): void {
  if (typeof window === 'undefined') return
  bootstrap()

  /* undefined 는 보내지 않는다. GA4 리포트에 "(not set)" 으로 잡혀 지표를 더럽힌다 */
  const clean: TrackParams = {}
  for (const [k, v] of Object.entries(params)) if (v !== undefined) clean[k] = v

  window.gtag!('event', name, clean)

  if (!GA_MEASUREMENT_ID && process.env.NODE_ENV !== 'production') {
    console.log('[GA4:off]', name, clean)
  }
}

/* 마크업에서 부르는 통로도 같은 함수로 연결한다 (TR-03 — 경로가 둘이어도 구현은 하나) */
if (typeof window !== 'undefined') window.track = track
