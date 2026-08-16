'use client'

import { useState } from 'react'
import { Empty } from '../ui'

type Row = {
  kind: 'Work' | 'Insight'
  slug: string
  title: string
  author: string
  thumb: string
  submitted: string
  href: string
}

export default function ApprovalsView({ rows }: { rows: Row[] }) {
  /* 반려는 사유 입력이 필수다 (FR-A07-04) — 사유 없이는 버튼이 눌리지 않는다.
     빌더 입장에서 "반려됨" 세 글자만 받으면 무엇을 고쳐야 할지 알 수 없다. */
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  return (
    <main id="main">
      <div className="adm-top">
        <div>
          <h1>승인 대기</h1>
          <p className="sub">빌더가 제출한 콘텐츠입니다. 승인하면 60초 이내에 공개 사이트에 반영됩니다.</p>
        </div>
        <div className="adm-top__r">
          <span className="st st--pending">{rows.length}건 대기</span>
        </div>
      </div>

      <div className="adm-body">
        {rows.length === 0 ? (
          <Empty title="승인을 기다리는 콘텐츠가 없습니다" desc="빌더가 제출하면 여기에 쌓입니다." />
        ) : (
          <div className="appr">
            {rows.map(r => (
              <div className="appr__row" key={r.kind + r.slug}>
                <img src={r.thumb} alt="" loading="lazy" />
                <div>
                  <span className="kind">{r.kind}</span>
                  <h3>{r.title}</h3>
                  <p className="meta">{r.author} · {r.submitted} 제출</p>

                  {rejecting === r.slug && (
                    <div className="f" style={{ marginTop: 12, marginBottom: 0 }}>
                      <label htmlFor={'rj-' + r.slug}>반려 사유 <span className="req">*</span></label>
                      <textarea id={'rj-' + r.slug} value={reason} onChange={e => setReason(e.target.value)}
                        style={{ minHeight: 66 }} placeholder="무엇을 고쳐야 하는지 구체적으로 적어주세요" />
                      <div style={{ display: 'flex', gap: 7, marginTop: 9 }}>
                        <button className="abtn abtn--sm abtn--danger" type="button" disabled={reason.trim() === ''}>
                          반려 확정
                        </button>
                        <button className="abtn abtn--sm" type="button"
                          onClick={() => { setRejecting(null); setReason('') }}>
                          취소
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="appr__acts">
                  {/* 미리보기는 공개 화면과 같은 렌더여야 한다 (FR-A07-02).
                      실제로는 비공개 토큰이 붙은 주소로 연다 — 지금은 공개 화면을 그대로 연다. */}
                  <a className="abtn abtn--sm" href={r.href} target="_blank" rel="noopener noreferrer">미리보기 ↗</a>
                  <button className="abtn abtn--sm" type="button"
                    onClick={() => { setRejecting(r.slug); setReason('') }}>
                    반려
                  </button>
                  <button className="abtn abtn--sm abtn--lime" type="button">승인 · 발행</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
