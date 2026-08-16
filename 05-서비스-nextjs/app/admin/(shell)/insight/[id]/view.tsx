'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '../../ui'
import type { Status } from '../../../_mock'

type Props = {
  isNew: boolean
  slug: string
  title: string
  excerpt: string
  cat: string
  author: string
  thumb: string | null
  bodyHtml: string | null
  status: Status
  updated: string
  rejectReason: string | null
  cats: Array<{ value: string; label: string }>
}

/* 툴바에 H1 이 없는 것은 의도다 — 페이지 제목이 h1 이라 본문에 또 두면 문서에 h1 이 둘이 된다
   (FR-A03-02: 툴바에서 차단 + 서버에서 강등). 그래서 H2 부터 시작한다. */
const TOOLS = [
  ['H2', 'H3'],
  ['B', 'I', 'S'],
  ['“”', '•', '1.'],
  ['🔗', '🖼', '⌗'],
]

export default function InsightEditView(p: Props) {
  const [slug, setSlug] = useState(p.slug)
  const [dirty, setDirty] = useState(false)
  const touch = () => setDirty(true)

  return (
    <main id="main">
      <div className="adm-top">
        <div>
          <h1>{p.isNew ? '새 글 작성' : 'Insight 편집'}</h1>
          <p className="sub">
            <Link href="/admin/insight" style={{ color: 'inherit' }}>← 목록으로</Link>
            {!p.isNew && <> · 마지막 수정 {p.updated}</>}
          </p>
        </div>
        <div className="adm-top__r">
          <Badge status={p.status} />
        </div>
      </div>

      <div className="adm-body">
        {/* 반려된 글에는 사유가 반드시 붙어 있다 (FR-A07-04) — 작성자가 무엇을 고칠지 알아야 한다 */}
        {p.rejectReason && (
          <div className="card" style={{ marginBottom: 18, borderColor: '#E3C4BE', background: '#FBF2F0' }}>
            <div className="card__b" style={{ padding: '14px 18px' }}>
              <b style={{ fontSize: 13, color: '#A02D1F' }}>반려 사유</b>
              <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>{p.rejectReason}</p>
            </div>
          </div>
        )}

        <div className="adm-edit">
          {/* ── 본문 ── */}
          <div>
            <div className="card">
              <div className="card__b">
                <div className="f">
                  <label htmlFor="ttl">제목 <span className="req">*</span></label>
                  <input id="ttl" type="text" defaultValue={p.title} onChange={touch}
                    placeholder="발주자가 검색할 표현으로 씁니다" />
                </div>
                <div className="f">
                  <label htmlFor="exc">요약 <span className="opt">목록 카드와 검색 결과에 노출</span></label>
                  <textarea id="exc" defaultValue={p.excerpt} onChange={touch} style={{ minHeight: 62 }}
                    placeholder="두 줄 이내로 씁니다" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card__h">
                <span>본문 — Tiptap</span>
                <span>{p.bodyHtml ? '작성됨' : '비어 있음'}</span>
              </div>
              <div className="card__b">
                <div className="ed">
                  <div className="ed__bar">
                    {TOOLS.map((group, gi) => (
                      <div key={gi} style={{ display: 'contents' }}>
                        {gi > 0 && <span className="sep" aria-hidden="true" />}
                        {group.map(t => <button key={t} type="button" title={t}>{t}</button>)}
                      </div>
                    ))}
                    <span className="note">H1 없음 — 페이지 제목이 h1</span>
                  </div>
                  {/* 목업이라 편집이 되지 않는다. 실제로는 Tiptap 이 이 자리에 마운트되고,
                      저장 시 서버에서 sanitize 한다 (FR-A03-01·03). */}
                  {p.bodyHtml
                    ? <div className="ed__body" dangerouslySetInnerHTML={{ __html: p.bodyHtml }} />
                    : (
                      <div className="ed__body" style={{ color: 'var(--muted-2)' }}>
                        <p>여기에 본문을 씁니다. 소제목은 H2 부터 시작합니다.</p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* ── 사이드 ── */}
          <div>
            <div className="card">
              <div className="card__h"><span>발행 설정</span></div>
              <div className="card__b">
                <div className="srow"><span className="k">상태</span><span className="v"><Badge status={p.status} /></span></div>
                <div className="srow"><span className="k">작성자</span><span className="v">{p.author}</span></div>
                <div className="srow"><span className="k">수정일</span><span className="v num">{p.updated}</span></div>
              </div>
            </div>

            <div className="card">
              <div className="card__h"><span>주소 · 분류</span></div>
              <div className="card__b">
                <div className="f">
                  <label htmlFor="slug">슬러그 <span className="req">*</span></label>
                  <div className="slug-row">
                    <span className="pre">/insight/</span>
                    <input id="slug" type="text" value={slug}
                      onChange={e => { setSlug(e.target.value); touch() }}
                      placeholder="핵심-키워드-조합" />
                  </div>
                  {/* 슬러그는 필수이고 중복이면 저장이 거부된다 (FR-A03-04).
                      발행 후 바꾸면 301 을 자동 생성한다 (FR-A03-05 · SR-06). */}
                  <p className="hint">
                    핵심 키워드를 조합합니다. 한글을 그대로 씁니다 — 예 <code>바이브코딩-외주-고르는법</code><br />
                    {p.status === 'published' && <b>발행 후 슬러그를 바꾸면 구 주소에 301 리다이렉트가 자동 생성됩니다.</b>}
                  </p>
                </div>
                <div className="f">
                  <label htmlFor="cat">카테고리 <span className="req">*</span></label>
                  <select id="cat" defaultValue={p.cat} onChange={touch}>
                    {p.cats.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card__h"><span>썸네일</span></div>
              <div className="card__b">
                <div className="drop">
                  {p.thumb && <img src={p.thumb} alt="" />}
                  {!p.thumb && <span className="ph">이미지를 끌어다 놓으세요<em>800×450px · 16:9</em></span>}
                </div>
                <p className="hint" style={{ marginTop: 10 }}>목록 카드 · 상세 커버 · OG 이미지에 함께 쓰입니다.</p>
              </div>
            </div>

            <div className="card">
              <div className="card__h"><span>SEO 메타</span></div>
              <div className="card__b">
                <div className="f">
                  <label htmlFor="st">검색 제목</label>
                  <input id="st" type="text" onChange={touch} placeholder="비워두면 제목을 그대로 씁니다" />
                </div>
                <div className="f">
                  <label htmlFor="sd">검색 설명</label>
                  <textarea id="sd" onChange={touch} style={{ minHeight: 62 }} placeholder="비워두면 요약에서 자동 생성됩니다" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 상태 머신대로만 움직인다 (§7.3 · FR-A03-07). 발행은 관리자만 누를 수 있다 */}
        <div className="adm-actions">
          <span className="warn">
            {dirty ? '⚠ 저장하지 않은 변경이 있습니다 — 나가면 사라집니다 (FR-A00-07)' : '목업이라 저장되지 않습니다'}
          </span>
          <button className="abtn" type="button">임시저장</button>
          <button className="abtn" type="button">제출 → 승인대기</button>
          <button className="abtn abtn--lime" type="button">발행</button>
        </div>
      </div>
    </main>
  )
}
