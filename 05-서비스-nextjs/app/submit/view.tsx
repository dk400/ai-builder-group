'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function SubmitView() {
  /* ★ 전환 측정 지점 — 가짜 전환 방어: src=pluug 토큰 확인 (검증 통과 시에만 발화) */
  useEffect(() => {
    if (new URLSearchParams(location.search).get('src') === 'pluug') {
      window.track?.('contact_submit', { verified: true })
    }
  }, [])

  return (
    <main id="main">
      <div className="wrap done">
        <svg className="check" viewBox="0 0 88 88" aria-hidden="true">
          <circle cx="44" cy="44" r="40" />
          <path d="M28 45 L40 57 L61 34" />
        </svg>
        <h1><span className="w300">문의가</span> 정상적으로 접수되었습니다</h1>
        <p>담당자가 확인 후 남겨주신 연락처로 연락드리겠습니다.</p>

        <div className="next">
          <Link className="ncard" href="/insight-detail">
            <b>바이브 코딩 외주, 잘하는 곳과 못하는 곳의 차이</b>
          </Link>
          <Link className="ncard" href="/content">
            <b>영상으로 보는 우리의 작업 →</b>
          </Link>
        </div>

        <Link className="btn btn--ghost" href="/">홈으로 돌아가기</Link>
      </div>
    </main>
  )
}
