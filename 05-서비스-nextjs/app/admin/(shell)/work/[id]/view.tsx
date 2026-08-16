'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '../../ui'
import { useRole } from '../../../role'
import type { Status } from '../../../_mock'

type Roster = { slug: string; name: string; avatar: string; role: string }

type Props = {
  isNew: boolean
  slug: string
  title: string
  summary: string
  tag: string
  year: string
  cover: string | null
  withPartner: boolean
  builders: string[]
  status: Status
  updated: string
  rejectReason: string | null
  roster: Roster[]
}

export default function WorkEditView(p: Props) {
  const { role } = useRole()
  const isAdmin = role === 'admin'
  const [slug, setSlug] = useState(p.slug)
  const [picked, setPicked] = useState<string[]>(p.builders)
  const [dirty, setDirty] = useState(false)
  const touch = () => setDirty(true)

  const toggle = (s: string) => {
    setPicked(prev => (prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]))
    touch()
  }

  return (
    <main id="main">
      <div className="adm-top">
        <div>
          <h1>{p.isNew ? '새 프로젝트' : 'Work 편집'}</h1>
          <p className="sub">
            <Link href="/admin/work" style={{ color: 'inherit' }}>← 목록으로</Link>
            {!p.isNew && <> · 마지막 수정 {p.updated}</>}
          </p>
        </div>
        <div className="adm-top__r"><Badge status={p.status} /></div>
      </div>

      <div className="adm-body">
        {/* 반려된 건에는 사유가 반드시 붙어 있다 (FR-A07-04) */}
        {p.rejectReason && (
          <div className="card" style={{ marginBottom: 18, borderColor: '#E3C4BE', background: '#FBF2F0' }}>
            <div className="card__b" style={{ padding: '14px 18px' }}>
              <b style={{ fontSize: 13, color: '#A02D1F' }}>반려 사유</b>
              <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>{p.rejectReason}</p>
            </div>
          </div>
        )}

        <div className="adm-edit">
          <div>
            <div className="card">
              <div className="card__b">
                <div className="f">
                  <label htmlFor="ttl">프로젝트명 <span className="req">*</span></label>
                  <input id="ttl" type="text" defaultValue={p.title} onChange={touch} />
                </div>
                <div className="f">
                  <label htmlFor="sum">개요 <span className="req">*</span> <span className="opt">목록 카드에 노출</span></label>
                  <textarea id="sum" defaultValue={p.summary} onChange={touch} style={{ minHeight: 62 }} />
                </div>
                <div className="f2">
                  <div className="f">
                    <label htmlFor="tag">분야 <span className="req">*</span></label>
                    <input id="tag" type="text" defaultValue={p.tag} onChange={touch} placeholder="Commerce · AI · AX …" />
                  </div>
                  <div className="f">
                    <label htmlFor="yr">연도 <span className="req">*</span></label>
                    <input id="yr" type="text" defaultValue={p.year} onChange={touch} placeholder="2026" />
                  </div>
                </div>
              </div>
            </div>

            {/* 본문을 자유 서식이 아니라 3막으로 나눠 받는다 (FR-A05-01) —
                works 테이블도 body_problem · body_solution · body_result 로 컬럼이 갈라져 있다.
                공개 화면의 렌더 구조를 고정하려는 설계다. 아홉 건이 같은 리듬으로 읽힌다. */}
            <div className="card">
              <div className="card__h"><span>본문 — 문제 · 해결 · 결과</span><span>공개 화면과 1:1</span></div>
              <div className="card__b">
                <div className="f">
                  <label htmlFor="b1">01 문제 <span className="req">*</span></label>
                  <textarea id="b1" onChange={touch} placeholder="클라이언트가 어떤 상황이었나 — 숫자가 있으면 숫자로" />
                </div>
                <div className="f">
                  <label htmlFor="b2">02 해결 <span className="req">*</span></label>
                  <textarea id="b2" onChange={touch} placeholder="무엇을 어떻게 했나 · 어떤 판단을 내렸나" />
                </div>
                <div className="f">
                  <label htmlFor="b3">03 결과 <span className="req">*</span></label>
                  <textarea id="b3" onChange={touch} placeholder="무엇이 달라졌나 · 다음 단계로 이어졌나" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card__h"><span>참여 빌더</span><span>{picked.length}명 선택</span></div>
              <div className="card__b">
                <div className="bpick">
                  {p.roster.map(b => {
                    const on = picked.includes(b.slug)
                    const idx = picked.indexOf(b.slug)
                    return (
                      <button key={b.slug} type="button" className={on ? 'on' : undefined}
                        aria-pressed={on} onClick={() => toggle(b.slug)}>
                        <i style={{ backgroundImage: `url(${b.avatar})` }} />
                        {b.name}
                        {/* 첫 번째가 리드다 — 목록 카드에는 리드만 표기된다 */}
                        {on && <span className="r">{idx === 0 ? '리드' : '참여'}</span>}
                      </button>
                    )
                  })}
                </div>
                <p className="hint" style={{ marginTop: 12 }}>
                  먼저 고른 빌더가 <b>리드</b>가 되고, 목록 카드에는 리드만 표기됩니다.
                  상세 페이지의 Project Sheet 에는 전원이 나옵니다.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <div className="card__h"><span>발행 설정</span></div>
              <div className="card__b">
                <div className="srow"><span className="k">상태</span><span className="v"><Badge status={p.status} /></span></div>
                <div className="srow"><span className="k">수정일</span><span className="v num">{p.updated}</span></div>
                <div className="srow">
                  <span className="k">함께한 팀</span>
                  <span className="v">
                    <label style={{ fontWeight: 600, fontSize: 13, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      <input type="checkbox" defaultChecked={p.withPartner} onChange={touch} />
                      똑똑한개발자
                    </label>
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card__h"><span>주소</span></div>
              <div className="card__b">
                <div className="f">
                  <label htmlFor="slug">슬러그 <span className="req">*</span></label>
                  <div className="slug-row">
                    <span className="pre">/work/</span>
                    <input id="slug" type="text" value={slug}
                      onChange={e => { setSlug(e.target.value); touch() }}
                      placeholder="업종·기술-프로젝트명" />
                  </div>
                  {/* 규칙 안내는 필수다 (FR-A05-03) — 고객사명이 URL 에 들어가면 되돌릴 수 없다 */}
                  <p className="hint">
                    <b>업종·기술 + 프로젝트명</b> 으로 씁니다. 한글을 그대로 씁니다.<br />
                    ⚠ <b>고객사명은 넣지 않습니다</b> — 공개 동의를 확인한 건만 예외입니다.<br />
                    예 <code>커머스-리빙-리뉴얼</code> · <code>ai-업무플랫폼-daisy</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card__h"><span>히어로 이미지</span></div>
              <div className="card__b">
                <div className="drop">
                  {p.cover && <img src={p.cover} alt="" />}
                  {!p.cover && <span className="ph">이미지를 끌어다 놓으세요<em>2400×1920px · 5:4</em></span>}
                </div>
                <p className="hint" style={{ marginTop: 10 }}>
                  목록 카드 · 상세 히어로 · OG 이미지에 함께 쓰입니다. 지정하지 않으면 OG 는 기본 카드로 나갑니다.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card__h"><span>SEO 메타</span></div>
              <div className="card__b">
                <div className="f">
                  <label htmlFor="st">검색 제목</label>
                  <input id="st" type="text" onChange={touch} placeholder="비워두면 프로젝트명을 씁니다" />
                </div>
                <div className="f">
                  <label htmlFor="sd">검색 설명</label>
                  <textarea id="sd" onChange={touch} style={{ minHeight: 62 }} placeholder="비워두면 개요에서 자동 생성됩니다" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="adm-actions">
          <span className="warn">
            {dirty
              ? '⚠ 저장하지 않은 변경이 있습니다 — 나가면 사라집니다 (FR-A00-07)'
              : isAdmin ? '목업이라 저장되지 않습니다' : '빌더는 제출까지 할 수 있습니다 · 발행은 관리자 승인 후'}
          </span>
          <button className="abtn" type="button">임시저장</button>
          <button className="abtn" type="button">제출 → 승인대기</button>
          {isAdmin && <button className="abtn abtn--lime" type="button">발행</button>}
        </div>
      </div>
    </main>
  )
}
