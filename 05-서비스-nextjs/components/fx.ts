'use client'

import { useEffect } from 'react'

/* v19.5 이음새 리본 — 문구 덱 로테이션(페이드 전환) + 곡선 흐름.
   여러 페이지에서 동일 스크립트가 반복돼 훅으로 공용화 */
export function useRibbonFlow(DECKS: Record<string, string[]>, ROT: Record<string, number>) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    type Flow = { tp: SVGTextPathElement; di: number; off: number; unit: number; speed: number }
    const flows: Flow[] = []
    const timeouts: number[] = []
    const intervals: number[] = []
    document.querySelectorAll<SVGTextPathElement>('[data-wflow]').forEach(tp => {
      const pid = (tp.getAttribute('href') || '').slice(1)
      const path = document.getElementById(pid) as unknown as SVGPathElement | null
      if (!path) return
      const decks = DECKS[pid] || [tp.textContent || '']
      const pathLen = path.getTotalLength()
      const txt = tp.parentNode as SVGTextElement
      txt.style.transition = 'opacity .45s ease'
      const f: Flow = {
        tp, di: 0, off: 0, unit: 10,
        speed: parseFloat(tp.dataset.speed || '0.022') * (tp.dataset.dir === 'rev' ? -1 : 1),
      }
      const setDeck = (i: number) => {
        f.di = i
        const phrase = decks[i]
        tp.textContent = phrase
        const one = Math.max(1, tp.getComputedTextLength())
        const n = Math.max(2, Math.ceil((pathLen * 1.5) / one) + 1)
        tp.textContent = new Array(n + 1).join(phrase)
        f.unit = (one / pathLen) * 100
        f.off = -f.unit / 2
      }
      setDeck(0)
      flows.push(f)
      /* 문구 로테이션 — 2.6초 첫 전환 후 기본 주기 반복. 백그라운드 탭에서는 전환 건너뜀 */
      if (!reduce && decks.length > 1) {
        const period = ROT[pid] || 5000
        const swap = () => {
          if (document.hidden) return
          txt.style.opacity = '0'
          timeouts.push(window.setTimeout(() => { setDeck((f.di + 1) % decks.length); txt.style.opacity = '1' }, 470))
        }
        timeouts.push(window.setTimeout(() => { swap(); intervals.push(window.setInterval(swap, period)) }, 2600))
      }
    })
    let raf = 0
    if (!reduce && flows.length) {
      const loop = () => {
        flows.forEach(f => {
          f.off -= f.speed
          if (f.off <= -f.unit) f.off += f.unit
          if (f.off > 0) f.off -= f.unit
          f.tp.setAttribute('startOffset', f.off + '%')
        })
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }
    return () => {
      cancelAnimationFrame(raf)
      timeouts.forEach(t => clearTimeout(t))
      intervals.forEach(t => clearInterval(t))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/* 플로팅 독 — 스크롤 진입 후 표시, 최종 CTA·푸터 근처/닫기 시 숨김.
   mode 'main': 히어로가 있는 페이지 (한 화면 스크롤 후 표시, 최종 CTA 근처 숨김)
   mode 'sub' : 서브 페이지 (얕은 스크롤에도 표시, 문서 최하단 근처에서만 숨김) */
export function useDock(mode: 'main' | 'sub' = 'main') {
  useEffect(() => {
    const dock = document.querySelector('[data-dock]')
    if (!dock) return
    let closed = false
    try { closed = sessionStorage.getItem('dock') === '1' } catch {}
    const xbtn = document.querySelector('[data-dock-x]') as HTMLElement | null
    const reopen = document.querySelector('[data-dock-open]') as HTMLElement | null
    const syncReopen = () => { if (reopen) reopen.classList.toggle('show', closed) }
    const endEl = document.querySelector('.s10') || document.querySelector('.cta-banner') || document.querySelector('footer')
    const upd = () => {
      if (closed) return
      if (mode === 'sub') {
        const nearEnd = window.scrollY + window.innerHeight > document.documentElement.scrollHeight - 140
        dock.classList.toggle('show', window.scrollY > 220 && !nearEnd)
        return
      }
      const nearEnd = !!endEl && endEl.getBoundingClientRect().top < window.innerHeight * 0.9
      dock.classList.toggle('show', window.scrollY > window.innerHeight * 0.85 && !nearEnd)
    }
    const onClose = () => {
      closed = true
      dock.classList.remove('show')
      try { sessionStorage.setItem('dock', '1') } catch {}
      syncReopen()
    }
    const onReopen = () => {
      closed = false
      try { sessionStorage.removeItem('dock') } catch {}
      syncReopen(); upd()
    }
    xbtn?.addEventListener('click', onClose)
    reopen?.addEventListener('click', onReopen)
    window.addEventListener('scroll', upd, { passive: true })
    upd(); syncReopen()
    return () => {
      window.removeEventListener('scroll', upd)
      xbtn?.removeEventListener('click', onClose)
      reopen?.removeEventListener('click', onReopen)
    }
  }, [])
}
