'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { BUILDERS, builderBySlug } from '@/app/_builders'
import { creditOf, worksByBuilder } from '@/app/_works'

/* 프로필 렌더 — 원본 builder.html 인라인 스크립트 이식.
   URL 쿼리(?b=슬러그)에 따라 data-el 슬롯에 프로필을 채운다.

   빌더·프로젝트 데이터는 app/_builders.ts · app/_works.ts 에 있다. 예전엔 이 파일이 열 명과
   아홉 건을 통째로 다시 적고 있었고, 참여 관계도 여기 projects 배열에만 있어서 프로젝트에서
   빌더를 거꾸로 찾을 수 없었다. 이제 관계는 WORKS.builders 한쪽에만 둔다. */

export default function BuilderView() {
  useEffect(() => {
    const esc = (s: string) => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML }
    const q = (sel: string) => document.querySelector<HTMLElement>('[data-el="' + sel + '"]')

    /* 없는 슬러그로 들어오면 첫 빌더로 떨어뜨린다. 라우트가 아니라 쿼리라 404 를 낼 수 없다 —
       빌더 프로필이 /builders/[slug] 로 승격되면(기획서 §14 Q6) 그때 404 로 바꾼다. */
    const fallback = BUILDERS[0]!
    const asked = new URLSearchParams(location.search).get('b') || ''
    const b = builderBySlug(asked) ?? fallback
    const id = b.slug

    document.title = b.name + ' — 빌더 프로필 | AI 빌더 그룹'
    q('crumb')!.textContent = b.name
    q('cap')!.textContent = 'Builder Profile — ' + b.no
    q('name')!.textContent = b.name
    q('role')!.textContent = b.role
    q('bio')!.textContent = b.bio
    q('focus')!.textContent = b.focus
    q('stack')!.textContent = b.stack.join(' · ')
    q('done')!.textContent = b.done + '건'
    q('sheetno')!.textContent = b.no
    q('prno')!.textContent = b.no
    q('fname')!.textContent = b.fname
    q('fname2')!.textContent = b.fname
    const lvEl = q('lv')!
    lvEl.textContent = b.levelLabel
    lvEl.classList.toggle('lv--lead', b.level === 'lead')
    lvEl.classList.toggle('lv--new', b.level === 'new')
    const ph = q('photo') as HTMLImageElement
    ph.src = b.avatar
    ph.alt = b.name + ' 프로필 사진'
    if (b.extra) {
      const ex = q('extra') as HTMLAnchorElement
      ex.hidden = false
      ex.href = b.extra.href
      ex.innerHTML = esc(b.extra.label) + ' <span class="arr">→</span>'
    }

    /* 일하는 원칙 */
    q('principles')!.innerHTML = b.principles.map((p, i) =>
      '<div class="pr-card rv d' + i + '"><span class="no">0' + (i + 1) + '</span><b>' + esc(p[0]) + '</b><p>' + esc(p[1]) + '</p></div>').join('')

    /* 작업물 그리드 — 참여 관계는 WORKS 쪽에 있다 */
    const mine = worksByBuilder(id)
    q('pcnt')!.textContent = '( ' + String(mine.length).padStart(2, '0') + ' )'
    q('pnote')!.textContent = '※ 공개 가능한 프로젝트만 게재합니다 · 전체 수행 ' + b.done + '건'
    q('plist')!.innerHTML = mine.map((w, i) =>
      '<a class="wcard rv d' + (i % 4) + '" href="/work/' + encodeURIComponent(w.slug) + '" data-cursor="VIEW →">' +
      '<div class="slot mask"><img class="cover" src="/assets/img/' + w.cover + '" alt="' + esc(w.coverAlt) + '" loading="lazy"></div>' +
      '<div class="meta"><div class="mrow"><span class="tag">' + esc(w.tag) + '</span><span class="yr num">' + w.year + '</span></div>' +
      '<h3>' + esc(w.title) + '</h3><p>' + esc(w.summary) + '</p>' +
      '<div class="builders">' + esc(creditOf(w)) + '</div></div></a>').join('')

    /* 다른 빌더 */
    q('others')!.innerHTML = BUILDERS.filter(o => o.slug !== id).map((o, i) => {
      return '<a class="ocard rv d' + i + '" href="/builder?b=' + o.slug + '">' +
        '<img src="' + o.avatar + '" alt="' + esc(o.name) + ' 프로필 사진">' +
        '<span><b>' + esc(o.name) + '</b><span>' + esc(o.role) + '</span></span>' +
        '<span class="arr">→</span></a>'
    }).join('')
  }, [])

  return (
    <main id="main">
      {/* 프로필 히어로 */}
      <section className="bp-hero" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <p className="crumb"><Link href="/work">Work</Link> / <Link href="/work#builders">검증된 빌더</Link> / <span data-el="crumb">빌더</span></p>
          <div className="bp-grid">
            <div className="bp-photo slot mask">
              <img data-el="photo" src="" alt="" />
              <span className="lv" data-el="lv">Builder</span>
              <div className="slot__spec"><b>Asset — 빌더 인물 사진</b><span>상반신 인물 컷 · 촬영 동의 후 실사진 교체</span><em>800×1000px · 4:5 @2x</em></div>
            </div>
            <div className="bp-info">
              <span className="t-cap" data-el="cap">Builder Profile</span>
              <h1 data-el="name">빌더</h1>
              <p className="bp-role" data-el="role"></p>
              <p className="bp-bio" data-el="bio"></p>
              <dl className="bp-facts">
                <div className="fhead"><span>Builder Sheet</span><span data-el="sheetno">B—001</span></div>
                <div className="row"><dt>전문 분야</dt><dd data-el="focus"></dd></div>
                <div className="row"><dt>주요 스택</dt><dd data-el="stack"></dd></div>
                <div className="row"><dt>수행 프로젝트</dt><dd className="num" data-el="done"></dd></div>
                <div className="row"><dt>함께한 파트너</dt><dd>똑똑한개발자</dd></div>
              </dl>
              <div className="bp-cta">
                <Link className="btn btn--lime" href="/contact" data-track="cta_click" data-location="builder_profile">이 빌더와 프로젝트 문의 <span className="arr">→</span></Link>
                <a className="btn btn--ghost" data-el="extra" href="#" hidden></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 일하는 원칙 */}
      <section className="bp-pr" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <div className="eyebrow"><i></i>How I Build<span className="no" data-el="prno">B—001</span></div>
          <div className="grid g3" data-el="principles"></div>
        </div>
      </section>

      {/* 수행 프로젝트 */}
      <section className="bp-work" style={{ paddingBottom: 20 }}>
        <div className="wrap">
          <div className="sec-head">
            <h2 style={{ fontSize: 'clamp(24px,3vw,34px)', margin: 0 }}><span data-el="fname">빌더</span>의 작업물</h2>
            <span className="head-cnt num" data-el="pcnt">( 00 )</span>
          </div>
          <p className="note" data-el="pnote">※ 공개 가능한 프로젝트만 게재합니다.</p>
          <div className="grid g2" data-el="plist"></div>
        </div>
      </section>

      {/* 다른 빌더 */}
      <section className="bp-others" style={{ paddingBottom: 30 }}>
        <div className="wrap">
          <div className="sec-head">
            <h2 style={{ fontSize: 'clamp(22px,2.6vw,30px)', margin: 0 }}>다른 빌더 보기</h2>
            <Link className="more-link" href="/work#builders">전체 빌더</Link>
          </div>
          <div className="grid g3" data-el="others"></div>
        </div>
      </section>

      <section style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="cta-banner">
            <div>
              <h3><span data-el="fname2">빌더</span>와 비슷한 프로젝트를 계획 중이신가요?</h3>
              <p>프로젝트 이야기를 들려주세요. 상황에 맞는 빌더와 진행 방식을 제안드립니다.</p>
            </div>
            <Link className="btn btn--lime" href="/contact" data-track="cta_click" data-location="builder_profile_bottom">프로젝트 문의 <span className="arr">→</span></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
