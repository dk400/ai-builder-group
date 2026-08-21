'use client'

import Link from 'next/link'
import { Fragment, useEffect } from 'react'
import { track } from '@/app/_track'

export type BuilderChip = { slug: string; name: string; avatar: string; roleLabel: string }

type Props = {
  slug: string
  cat: string
  title: string
  summary: string
  tag: string
  year: string
  cover: string
  coverAlt: string
  withPartner: boolean
  builders: BuilderChip[]
  /* 케이스 본문. works 테이블의 body_problem · body_solution · body_result 가 그대로 온다.
     셋 다 비어 있으면 아래 '준비 중' 안내가 그 자리를 지킨다 — 예시 원고를 복제하지
     않기 위한 선택이다 (app/_works.ts 주석). */
  bodyProblem?: string | null
  bodySolution?: string | null
  bodyResult?: string | null
  /* 승인 전 미리보기는 저장소 URL 을 그대로 넘긴다 (thumb_url 에 파일명 규칙이 없다).
     없으면 지금까지처럼 공개 에셋 경로를 조립한다. */
  coverSrc?: string | null
}

export default function WorkDetailView(p: Props) {
  useEffect(() => {
    track('work_detail_view', { slug: p.slug, category: p.cat })
  }, [p.slug, p.cat])

  /* 세 절이 각각 없을 수 있다. 번호(02·03·04)는 있는 절에만 순서대로 붙어야 —
     '문제' 없이 '03 해결'부터 시작하는 화면이 나오면 잘린 것처럼 읽힌다. */
  const sections = [
    { key: 'problem', label: '문제', html: p.bodyProblem },
    { key: 'solution', label: '해결', html: p.bodySolution },
    { key: 'result', label: '결과', html: p.bodyResult },
  ].filter(s => Boolean(s.html))

  return (
    <main id="main">
      <div className="wrap wd-head">
        <Link className="backlink" href="/work">Work 목록으로</Link>
        <h1>{p.title}</h1>
        <p className="sum">{p.summary}</p>
        <div className="tags">
          <span className="tag">{p.tag}</span>
          <span className="tag num">{p.year}</span>
        </div>
      </div>

      <div className="wrap wd-cover">
        <div className="slot mask">
          <img className="cover" src={p.coverSrc ?? `/assets/img/${p.cover}`} alt={p.coverAlt} />
          <div className="slot__spec"><b>Asset — Case Hero</b><span>실서비스 대표 화면 · 최고 퀄리티 1장</span><em>2100×1000px · 21:10 @2x</em></div>
        </div>
      </div>

      <div className="wrap wd-body">
        <article className="wd-art">
          <h2><span className="no">01</span>개요</h2>
          <p>{p.summary}</p>

          {/* 케이스 본문(문제·해결·결과)은 어드민에서 프로젝트별로 입력한다 — works 테이블의
              body_problem · body_solution · body_result 세 컬럼이 그 자리다.
              아홉 건에 같은 예시 원고를 복제해 두면 없는 사실을 아홉 번 주장하는 셈이고,
              색인에는 중복 문서로 잡힌다. 그래서 채워지기 전까지는 비워 둔다.

              ⚠ 본문 HTML 은 서버에서 sanitize 한 값만 들어와야 한다 (NFR-13).
                어드민 저장 경로가 붙기 전까지는 코드 안의 고정 문자열뿐이다. */}
          {/* ⚠ h2 를 <section> 으로 감싸지 않는다. detail.css 의 `.wd-art h2:first-child`
              가 절마다 걸려 절 사이 여백(52px)이 통째로 사라진다 */}
          {sections.length > 0 ? (
            sections.map((s, i) => (
              <Fragment key={s.key}>
                <h2><span className="no">{String(i + 2).padStart(2, '0')}</span>{s.label}</h2>
                <div dangerouslySetInnerHTML={{ __html: s.html as string }} />
              </Fragment>
            ))
          ) : (
            <div className="empty" style={{ marginTop: 34, padding: '56px 24px' }}>
              <span className="k">Case Study</span>
              <h3>이 프로젝트의 상세 기록은 준비 중입니다</h3>
              <p>문제·해결·결과를 정리해 순차적으로 공개하고 있습니다.</p>
              <Link className="btn btn--ghost btn--sm" href="/work">다른 작업물 보기</Link>
              <Link className="btn btn--ink btn--sm" href="/contact">비슷한 프로젝트 문의 <span className="arr">→</span></Link>
            </div>
          )}
        </article>

        <aside className="aside">
          <div className="aside__head"><span>Project Sheet</span><span>{p.tag}</span></div>
          <dl>
            <div className="row"><dt>연도</dt><dd className="num">{p.year}</dd></div>
            <div className="row"><dt>분야</dt><dd>{p.tag}</dd></div>
            {p.withPartner && <div className="row"><dt>함께한 팀</dt><dd>똑똑한개발자</dd></div>}
            <div className="row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <dt>참여 빌더</dt>
              <dd style={{ textAlign: 'left' }}>
                {p.builders.map(b => (
                  <Link className="b-chip" href={`/builder?b=${b.slug}`} style={{ textDecoration: 'none' }} key={b.slug}>
                    <i style={{ backgroundImage: `url(${b.avatar})`, backgroundSize: 'cover' }}></i>{b.name} · {b.roleLabel}
                  </Link>
                ))}
              </dd>
            </div>
          </dl>
          <p className="note">빌더 칩을 누르면 프로필과 작업물로 이동합니다.</p>
        </aside>
      </div>

      <section style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="wrap">
          <div className="cta-banner">
            <div>
              <h3>비슷한 프로젝트를 계획 중이신가요?</h3>
              <p>지금 상황을 알려주시면, 맞는 빌더와 진행 방식을 제안드립니다.</p>
            </div>
            <Link className="btn btn--lime" href="/contact" data-track="cta_click" data-location="work_detail">프로젝트 문의 <span className="arr">→</span></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
