'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function InsightDetailView() {
  useEffect(() => {
    window.track?.('insight_detail_view', { slug: '바이브코딩-외주-차이', category: 'client-guide', author_type: 'team' })
    /* TOC 현재 위치 하이라이트 */
    const links = document.querySelectorAll('.toc a')
    const heads = ['t1', 't2', 't3'].map(id => document.getElementById(id))
    const onScroll = () => {
      let i = heads.length - 1
      while (i > 0 && heads[i] && heads[i]!.getBoundingClientRect().top > 140) i--
      links.forEach((l, j) => l.classList.toggle('now', j === i))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main id="main">
      <div className="wrap art-head">
        <Link className="backlink" href="/insight">인사이트 목록으로</Link>
        <h1>바이브 코딩 외주,<br />잘하는 곳과 못하는 곳의 차이</h1>
        <p className="meta">발주 가이드 · <b>운영팀</b> · 2026.08.11 · 읽는 데 4분</p>
      </div>

      <div className="wrap art-body">
        <article className="art">
          <div className="ph ph--tall" data-label="Cover Image"><span className="fx">I—001 / COVER</span></div>

          <p>&quot;바이브 코딩으로 외주해 드립니다&quot;라는 업체가 빠르게 늘고 있습니다. 같은 도구를 쓴다고 같은 결과가 나오지 않는데도, 밖에서 보면 구분이 어렵습니다. 이 글은 발주하는 입장에서 그 차이를 가려내는 기준을 정리한 것입니다.</p>

          <h2 id="t1">첫째, 포트폴리오의 &apos;실체&apos;를 물어보세요</h2>
          <p>포트폴리오 개수가 많다고 실적이 많은 것이 아닙니다. 실제로 존재하지 않는 프로젝트를 산업별 목업으로 만들어두는 업체가 있습니다. 확인 방법은 간단합니다 — &quot;이 프로젝트, 실제 서비스 URL을 알려주실 수 있나요?&quot;라고 물어보면 됩니다.</p>
          <blockquote>실제로 수행한 프로젝트라면, 보여주지 못할 이유가 없습니다.</blockquote>

          <h2 id="t2">둘째, 사이트의 만듦새를 보세요</h2>
          <p>그 업체의 자체 사이트를 열어보세요. 모든 섹션이 똑같은 방식으로 움직인다면 — 모든 텍스트가 동일하게 아래에서 위로 떠오르기만 한다면 — 그것은 AI로 한 번에 생성하고 손보지 않았다는 신호입니다. 자기 사이트에 시간을 쓰지 않는 팀이 고객 사이트에 시간을 쓸 가능성은 낮습니다.</p>

          <div className="yt" data-track="youtube_outbound" data-slug="quality-video"><div className="play"><i>▶</i></div></div>
          <p className="yt-link"><Link href="/content">유튜브에서 보기 →</Link></p>

          <h2 id="t3">셋째, 가격이 아니라 구조를 물어보세요</h2>
          <p>&quot;반값&quot;을 앞세우는 곳은 조심해야 합니다. 물어야 할 것은 가격이 아니라 구조입니다 — 누가 만드는지, 어떻게 검증된 사람인지, 진행 중에 무엇을 확인시켜 주는지, 끝나면 무엇을 넘겨주는지. 이 네 가지에 명확히 답하는 팀이라면 도구가 무엇이든 결과물이 나옵니다.</p>

          <div className="tags"><span className="tag">발주 가이드</span><span className="tag">외주</span><span className="tag">체크리스트</span></div>
        </article>

        <nav className="toc" aria-label="목차">
          <b>Contents</b>
          <a href="#t1" className="now">1. 포트폴리오의 실체</a>
          <a href="#t2">2. 사이트의 만듦새</a>
          <a href="#t3">3. 가격이 아니라 구조</a>
        </nav>
      </div>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 776 }}>
          <h3 className="rel-h">함께 읽기</h3>
          <Link className="relrow" href="/insight-detail"><span className="c">발주 가이드</span><span className="t">외주 맡기기 전 확인해야 할 5가지</span></Link>
          <Link className="relrow" href="/insight-detail"><span className="c">일하는 방식</span><span className="t">우리가 3주 만에 랜딩 페이지를 만드는 순서</span></Link>
          <div className="cta-banner" style={{ marginTop: 52 }}>
            <div>
              <h3>글이 도움되셨나요?</h3>
              <p>프로젝트 이야기를 들려주세요.</p>
            </div>
            <Link className="btn btn--lime" href="/contact" data-track="cta_click" data-location="insight_detail">문의하기 <span className="arr">→</span></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
