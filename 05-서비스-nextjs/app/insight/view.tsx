'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRibbonFlow, useDock } from '@/components/fx'
import { CATEGORY_LABEL, countByCategory, latestArticles, pad2 } from '@/app/_insights'
import type { InsightCategory } from '@/app/_insights'

/* 아티클 데이터는 app/_insights.ts 에 있다. 홈 S7 이 같은 배열을 본다.
   칩의 건수도 거기서 세므로, 글을 추가해도 이 파일은 건드릴 일이 없다. */
const CATS: Array<{ key: InsightCategory | 'all'; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'ai-ax', label: CATEGORY_LABEL['ai-ax'] },
  { key: 'guide', label: CATEGORY_LABEL.guide },
  { key: 'how', label: CATEGORY_LABEL.how },
  { key: 'project', label: CATEGORY_LABEL.project },
]

export default function InsightView() {
  useRibbonFlow({
    rsI: [
      '발주 가이드 ✳ 일하는 방식 ✳ AI · AX ✳ 프로젝트 비하인드 ✳ ',
      'READ BEFORE YOU BUILD ✳ 외주 전 필독 ✳ ',
      '실패하는 발주에는 패턴이 있다 ✳ INSIGHT WEEKLY ✳ ',
      'AI BUILDER GROUP ✳ 우리의 생각을 공개합니다 ✳ ',
    ],
  }, { rsI: 5500 })
  useDock('sub')

  /* 카테고리 필터 */
  useEffect(() => {
    const rows = document.querySelectorAll<HTMLElement>('[data-list] .arow')
    const empty = document.querySelector('[data-empty]') as HTMLElement | null
    document.querySelectorAll<HTMLElement>('.cats button').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.cats button').forEach(x => x.classList.remove('on'))
        b.classList.add('on')
        const cat = b.dataset.cat
        let n = 0
        rows.forEach(r => {
          const show = cat === 'all' || r.dataset.c === cat
          r.style.display = show ? '' : 'none'
          if (show) n++
        })
        if (empty) empty.hidden = n > 0
        history.replaceState(null, '', cat === 'all' ? '#' : '#' + cat)
      })
    })
  }, [])

  return (
    <>
      <main id="main">
        <div className="page-head">
          <div className="wrap">
            <h1><span className="w300">우리의</span> 생각</h1>
            <p>파트너 똑똑한개발자의 실제 인사이트를 함께 발행합니다.</p>
          </div>
        </div>

        {/* v19: 이음새 리본 — 페이지 헤드 ↔ 목록 */}
        <div className="ribbon-sep" aria-hidden="true">
          <svg viewBox="0 0 1600 200" preserveAspectRatio="xMidYMid slice">
            <path id="rsI" d="M -80,100 C 220,185 480,15 780,100 C 1080,185 1340,15 1700,100" fill="none" />
            <use href="#rsI" className="edge" />
            <use href="#rsI" className="lane" />
            <text>
              <textPath href="#rsI" data-wflow data-unit="4" data-speed="0.02">발주 가이드 ✳ 일하는 방식 ✳ AI · AX ✳ 프로젝트 비하인드 ✳ 발주 가이드 ✳ 일하는 방식 ✳ AI · AX ✳ 프로젝트 비하인드 ✳ </textPath>
            </text>
          </svg>
        </div>

        <div className="wrap ins">
          {/* 카테고리: 전환 시 URL 경로 변경 (실서비스: /insight/[category]) */}
          <nav className="cats" aria-label="카테고리">
            {CATS.map((c, i) => (
              <button className={i === 0 ? 'on' : undefined} data-cat={c.key} key={c.key}>
                {c.label} <span className="cnt">{pad2(countByCategory(c.key))}</span>
              </button>
            ))}
          </nav>

          <div data-list>
            {latestArticles().map(a => (
              <Link className="arow" href={`/insight/${a.slug}`} data-c={a.cat} key={a.slug}>
                <img className="athumb" src={`/assets/img/ins/${a.thumb}`} alt="" loading="lazy" />
                <div>
                  <h3>{a.title}</h3>
                  <span className="cat">{CATEGORY_LABEL[a.cat]}</span>
                  <p>{a.excerpt}</p>
                  <span className="meta">{a.author} · {a.date}</span>
                </div>
              </Link>
            ))}

            <div className="empty" data-empty hidden style={{ marginTop: 24 }}>
              <h3>이 주제의 첫 글을 준비 중입니다</h3>
              <p>다른 카테고리의 글을 먼저 읽어보세요.</p>
            </div>

            <div style={{ textAlign: 'center', marginTop: 40 }}><button className="btn btn--ghost">더 보기</button></div>
          </div>
        </div>
      </main>

      {/* 플로팅 CTA 독 */}
      <div className="dock" data-dock>
        <div className="dock__txt"><b>검증된 바이브 코딩</b><span>무료 문의 — 부담 없이 남겨보세요</span></div>
        <Link className="btn btn--lime btn--sm" href="/contact" data-track="cta_click" data-location="floating">프로젝트 문의 <span className="arr">→</span></Link>
        <button className="dock__x" aria-label="닫기" data-dock-x>✕</button>
      </div>
      <button className="dock-open" data-dock-open aria-label="문의 바 다시 열기">💬</button>
    </>
  )
}
