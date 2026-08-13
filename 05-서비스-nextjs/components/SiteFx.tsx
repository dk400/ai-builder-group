'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    track?: (name: string, params?: Record<string, unknown>) => void
  }
}

/* assets/app.js 공통 스크립트 이식 —
   리빌/마스크 IntersectionObserver · GA4 스텁 · 에셋 가이드 토글 · 커서 추종 "VIEW →"
   pathname이 바뀔 때마다 새 페이지의 .rv/.mask를 다시 관찰한다 */
export default function SiteFx() {
  const pathname = usePathname()
  const [assets, setAssets] = useState(false)
  const curRef = useRef<HTMLDivElement>(null)

  /* GA4 이벤트 스텁 — [data-track] 클릭 위임 */
  useEffect(() => {
    window.track = (name, params) => console.log('[GA4]', name, params || {})
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]')
      if (!el) return
      const p: Record<string, string> = {}
      if (el.dataset.location) p.location = el.dataset.location
      if (el.dataset.slug) p.slug = el.dataset.slug
      if (el.dataset.topic) p.topic = el.dataset.topic
      window.track!(el.dataset.track!, p)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  /* 에셋 가이드 토글 상태 복원 */
  useEffect(() => {
    try { if (sessionStorage.getItem('assets')) setAssets(true) } catch {}
  }, [])
  useEffect(() => {
    document.body.classList.toggle('assets', assets)
  }, [assets])

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

  /* 커서 추종 "VIEW →" — [data-cursor] 요소 위에서만 (cuberto, 과용 금지) */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !window.matchMedia('(hover: hover)').matches) return
    const cur = curRef.current
    if (!cur) return
    let overTarget = false
    const onMove = (e: MouseEvent) => {
      if (overTarget) { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px' }
    }
    const onOver = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-cursor]')
      if (!el) return
      overTarget = true
      cur.textContent = el.dataset.cursor || 'VIEW →'
      cur.style.left = e.clientX + 'px'
      cur.style.top = e.clientY + 'px'
      cur.classList.add('on')
    }
    const onOut = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-cursor]')
      if (!el) return
      const to = e.relatedTarget as Element | null
      if (to && el.contains(to)) return
      overTarget = false
      cur.classList.remove('on')
    }
    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  const toggleAssets = () => {
    setAssets(v => {
      try { sessionStorage.setItem('assets', v ? '' : '1') } catch {}
      return !v
    })
  }

  return (
    <>
      <button className="asset-toggle" type="button" aria-pressed={assets} onClick={toggleAssets}>
        ASSET GUIDE
      </button>
      <div ref={curRef} className="cur" aria-hidden="true">VIEW →</div>
    </>
  )
}
