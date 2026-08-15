'use client'

import { useEffect } from 'react'

/* v19.5 이음새 리본 — 문구 덱 로테이션(페이드 전환) + 곡선 흐름.
   여러 페이지에서 동일 스크립트가 반복돼 훅으로 공용화 */
export function useRibbonFlow(DECKS: Record<string, string[]>, ROT: Record<string, number>) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    type Built = { text: string; unit: number }
    type Flow = {
      tp: SVGTextPathElement; svg: SVGSVGElement; di: number; off: number
      unit: number; speed: number; decks: string[]; cache: (Built | null)[]
    }
    const flows: Flow[] = []
    const timeouts: number[] = []
    const intervals: number[] = []
    document.querySelectorAll<SVGTextPathElement>('[data-wflow]').forEach(tp => {
      const pid = (tp.getAttribute('href') || '').slice(1)
      const path = document.getElementById(pid) as unknown as SVGPathElement | null
      const svg = tp.ownerSVGElement
      if (!path || !svg) return
      const decks = DECKS[pid] || [tp.textContent || '']
      const pathLen = path.getTotalLength()
      const txt = tp.parentNode as SVGTextElement
      txt.style.transition = 'opacity .45s ease'
      const f: Flow = {
        tp, svg, di: 0, off: 0, unit: 10, decks, cache: decks.map(() => null),
        speed: parseFloat(tp.dataset.speed || '0.022') * (tp.dataset.dir === 'rev' ? -1 : 1),
      }
      /* 반복 문자열과 한 마디 길이는 문구마다 한 번만 재서 캐시한다.
         getComputedTextLength() 는 강제 동기 레이아웃이라 회전할 때마다 부르면 그때마다 프레임이 튄다.
         재는 동안 textContent 를 잠깐 바꾸지만 같은 태스크 안에서 되돌리므로 화면에는 안 보인다. */
      const build = (i: number): Built => {
        const hit = f.cache[i]
        if (hit) return hit
        const phrase = decks[i] || ''
        const keep = tp.textContent
        tp.textContent = phrase
        const one = Math.max(1, tp.getComputedTextLength())
        tp.textContent = keep
        const n = Math.max(2, Math.ceil((pathLen * 1.5) / one) + 1)
        const made: Built = { text: new Array(n + 1).join(phrase), unit: (one / pathLen) * 100 }
        f.cache[i] = made
        return made
      }
      const setDeck = (i: number) => {
        f.di = i
        const { text, unit } = build(i)
        tp.textContent = text
        f.unit = unit
        f.off = -unit / 2
      }
      setDeck(0)
      flows.push(f)
      /* 나머지 문구는 마운트 직후 한 번에 만들어 둔다 — 첫 회전 때 한 번씩 튀는 것까지 없앤다 */
      if (decks.length > 1) timeouts.push(window.setTimeout(() => decks.forEach((_, i) => build(i)), 0))
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
    let prev = 0
    const shown = new Set<Element>()
    let io: IntersectionObserver | null = null

    /* 프레임 수가 아니라 경과 시간으로 움직인다.
       기존에는 프레임당 고정량(실측 0.024%)이라 120Hz 화면에서 두 배 빨랐고, 프레임이 밀리면
       그만큼 리본이 제자리에 멎어 중간중간 끊겨 보였다. 탭 복귀 직후 확 튀는 걸 막으려 dt 에 상한. */
    const loop = (now: number) => {
      const dt = prev ? Math.min(now - prev, 50) : 16.667
      prev = now
      const k = dt / 16.667
      flows.forEach(f => {
        if (!shown.has(f.svg)) return
        f.off -= f.speed * k
        while (f.off <= -f.unit) f.off += f.unit
        while (f.off > 0) f.off -= f.unit
        f.tp.setAttribute('startOffset', f.off.toFixed(4) + '%')
      })
      raf = requestAnimationFrame(loop)
    }
    const start = () => { if (!raf) { prev = 0; raf = requestAnimationFrame(loop) } }
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0 } }

    if (!reduce && flows.length) {
      /* 화면 밖 리본은 돌리지 않는다. textPath 는 startOffset 을 건드릴 때마다 글자 배치를
         다시 잡기 때문에, 안 보이는데 계속 돌면 스크롤에 쓸 프레임을 그대로 갉아먹는다. */
      io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) shown.add(e.target); else shown.delete(e.target) })
        if (shown.size) start(); else stop()
      }, { rootMargin: '200px 0px' })
      flows.forEach(f => io!.observe(f.svg))
    }

    return () => {
      stop()
      io?.disconnect()
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
