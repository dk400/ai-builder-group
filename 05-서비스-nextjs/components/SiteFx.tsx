'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { track, type TrackEvent, type TrackParams } from '@/app/_track'

/* assets/app.js 공통 스크립트 이식 —
   리빌/마스크 IntersectionObserver · [data-track] 클릭 위임
   pathname이 바뀔 때마다 새 페이지의 .rv/.mask를 다시 관찰한다 */
export default function SiteFx() {
  const pathname = usePathname()

  /* [data-track] 클릭 위임 — 발화 자체는 공통 래퍼(app/_track.ts)가 한다 (TR-03).

     예전에는 이 effect 안에서 window.track 을 정의했는데, 그 시점이 페이지 컴포넌트의
     effect 보다 늦어서 상세 페이지 첫 진입 이벤트(work_detail_view · insight_detail_view)가
     통째로 사라졌다. 정의는 모듈로 옮겼고 여기는 위임만 남긴다. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]')
      if (!el) return
      /* 마크업이 실어 보낼 수 있는 파라미터는 규약(PRD §8.2)에 있는 것만 받는다 */
      const p: TrackParams = {}
      if (el.dataset.location) p.location = el.dataset.location
      if (el.dataset.slug) p.slug = el.dataset.slug
      if (el.dataset.topic) p.topic = el.dataset.topic
      if (el.dataset.category) p.category = el.dataset.category
      if (el.dataset.videoId) p.video_id = el.dataset.videoId
      if (el.dataset.utmCampaign) p.utm_campaign = el.dataset.utmCampaign
      track(el.dataset.track as TrackEvent, p)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  /* 리빌 (IntersectionObserver) — 페이지 전환마다 재관찰 */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* 해시 진입 시 위치 확정 (v22: smooth 스크롤 · lazy 이미지 충돌 방지) */
    if (location.hash) {
      document.documentElement.style.scrollBehavior = 'auto'
      let t: Element | null = null
      try { t = document.querySelector(location.hash) } catch {}
      t?.scrollIntoView()
      setTimeout(() => {
        try { document.querySelector(location.hash)?.scrollIntoView() } catch {}
        document.documentElement.style.scrollBehavior = ''
      }, 250)
    }

    if (reduced || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.rv, .mask').forEach(el => el.classList.add('on'))
      return
    }
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target) }
      })
    }, { threshold: 0.15 })
    document.querySelectorAll('.rv').forEach(el => io.observe(el))
    /* 마스크 리빌 — clip 상태에선 자신의 교차 면적이 0이므로 부모를 관찰 */
    const mio = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.mask').forEach(m => m.classList.add('on'))
          mio.unobserve(e.target)
        }
      })
    }, { threshold: 0.15 })
    document.querySelectorAll('.mask').forEach(m => { if (m.parentElement) mio.observe(m.parentElement) })
    return () => { io.disconnect(); mio.disconnect() }
  }, [pathname])

  /* ASSET GUIDE 토글은 제거했다.
     어떤 이미지를 몇 픽셀로 넣을지 화면 위에 겹쳐 보여주는 제작용 도구인데, 전 페이지
     우하단에 떠 있어 실사용자에게도 보였다. 릴리즈에는 없어야 한다.
     스펙 자체는 .slot__spec 마크업에 남아 CSS 로 감춰져 있으므로, 내부에서 다시 보려면
     이 버튼과 body.assets 스위치만 되살리면 된다. */

  return null
}
