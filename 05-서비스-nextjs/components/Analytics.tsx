'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { GA_MEASUREMENT_ID } from '@/app/_integrations'
import { track } from '@/app/_track'

/* GA4 로더 — TR-01 · IR-05

   측정 ID 는 클라이언트 계정에서 받은 값을 NEXT_PUBLIC_GA_ID 로 넣는다.
   비어 있으면 스크립트를 아예 싣지 않는다: 개발·프리뷰에서 실계정 지표가 오염되지 않고,
   키 없이도 사이트가 그대로 도는 이 저장소의 규칙(pluug · 채널톡)과도 맞는다.

   page_view 를 손으로 쏘는 이유 —
   App Router 의 화면 전환은 문서를 다시 불러오지 않는다. gtag 의 자동 page_view 는
   최초 1회만 잡히고, 그 뒤 Work → Insight → 문의로 이어지는 경로가 통째로 사라진다.
   §1.2 ⓑ 가 요구하는 "상태 분기를 URL 로 남긴다"도 여기서 실제 지표가 된다. */
export default function Analytics() {
  const pathname = usePathname()
  const lastUrl = useRef('')

  useEffect(() => {
    /* useSearchParams 를 쓰지 않는다 — 그 훅은 페이지를 동적 렌더로 끌어내려
       13개 라우트의 정적 생성(SR-01)을 깨뜨린다. 값은 location 에서 직접 읽는다. */
    const send = () => {
      const url = location.pathname + location.search
      if (url === lastUrl.current) return   /* 해시 이동·리렌더로 중복 발화하지 않게 */
      lastUrl.current = url
      track('page_view', {
        page_location: location.href,
        page_path: url,
        /* 한 프레임 뒤에 읽는다 — Next 가 <title> 을 갈아끼우기 전에 읽으면 이전 화면 제목이 실린다 */
        page_title: document.title,
      })
    }
    const id = requestAnimationFrame(send)
    return () => cancelAnimationFrame(id)
  }, [pathname])

  if (!GA_MEASUREMENT_ID) return null

  return (
    <Script
      id="ga4"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
  )
}
