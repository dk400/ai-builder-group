'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { track } from '@/app/_track'

type TocItem = { id: string; text: string }
type Related = { slug: string; title: string; catLabel: string }

type Props = {
  slug: string
  cat: string
  catLabel: string
  title: string
  thumb: string
  author: string
  authorType: 'team' | 'partner'
  date: string
  readMin: number | null
  bodyHtml: string | null
  toc: TocItem[]
  related: Related[]
}

export default function InsightDetailView(p: Props) {
  useEffect(() => {
    track('insight_detail_view', { slug: p.slug, category: p.cat, author_type: p.authorType })
  }, [p.slug, p.cat, p.authorType])

  /* 목차 현재 위치 하이라이트.
     예전엔 t1·t2·t3 을 코드에 박아 두어서 소제목이 셋이 아닌 글에서는 어긋났다.
     이제 본문에서 뽑은 목차를 그대로 따라간다. */
  useEffect(() => {
    if (p.toc.length === 0) return
    const links = document.querySelectorAll('.toc a')
    const heads = p.toc.map(t => document.getElementById(t.id))
    const onScroll = () => {
      let i = heads.length - 1
      while (i > 0 && heads[i] && heads[i]!.getBoundingClientRect().top > 140) i--
      links.forEach((l, j) => l.classList.toggle('now', j === i))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [p.toc])

  const metaLine = [p.catLabel, null, p.date, p.readMin ? `읽는 데 ${p.readMin}분` : null]
    .filter(Boolean) as string[]

  return (
    <main id="main">
      <div className="wrap art-head">
        <Link className="backlink" href="/insight">인사이트 목록으로</Link>
        <h1>{p.title}</h1>
        <p className="meta">
          {metaLine[0]} · <b>{p.author}</b>
          {metaLine.slice(1).map(m => <span key={m}> · {m}</span>)}
        </p>
      </div>

      <div className="wrap art-body">
        <article className="art">
          {/* 목업 시절엔 검은 플레이스홀더 박스였다. 글마다 썸네일(800×450)이 실제로 있으므로
              그걸 쓴다 — 목록에서 본 그림과 상세의 그림이 같아야 같은 글로 읽힌다.
              제목이 바로 위에 h1 으로 있으므로 커버는 장식이다 → alt="" */}
          <div className="slot mask art-cover">
            <img className="cover" src={`/assets/img/ins/${p.thumb}`} alt="" />
          </div>

          {/* 본문은 어드민 Tiptap 이 만든 HTML 이 그대로 들어올 자리다 (insights.body_html).
              5단계에서 서버 sanitize 를 거친 값으로 바뀌므로 여기서 손대지 않는다. */}
          {p.bodyHtml
            ? <div dangerouslySetInnerHTML={{ __html: p.bodyHtml }} />
            : (
              <div className="empty" style={{ padding: '56px 24px' }}>
                <span className="k">Insight</span>
                <h3>전문은 준비 중입니다</h3>
                <p>정리되는 대로 이 자리에 공개합니다.</p>
                <Link className="btn btn--ghost btn--sm" href="/insight">다른 글 보기</Link>
              </div>
            )}
        </article>

        {p.toc.length > 0 && (
          <nav className="toc" aria-label="목차">
            <b>Contents</b>
            {p.toc.map((t, i) => (
              <a href={`#${t.id}`} className={i === 0 ? 'now' : ''} key={t.id}>{i + 1}. {t.text}</a>
            ))}
          </nav>
        )}
      </div>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 776 }}>
          <h3 className="rel-h">함께 읽기</h3>
          {p.related.map(r => (
            <Link className="relrow" href={`/insight/${r.slug}`} key={r.slug}>
              <span className="c">{r.catLabel}</span><span className="t">{r.title}</span>
            </Link>
          ))}
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
