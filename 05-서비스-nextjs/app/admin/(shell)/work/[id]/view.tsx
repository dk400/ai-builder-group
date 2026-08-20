'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '../../ui'
import { useRole } from '../../../role'
import ImageDrop from '../../ImageDrop'
import SlugField from '../../SlugField'
import { allowedTransitions, canEdit, type Status } from '../../../_transitions'

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

/* A-05 Work 편집.

   Insight 편집(A-03)과 같은 결함이 그대로 있었다 — 동작하지 않는 드롭존, 손으로 쓰는 슬러그,
   상태와 무관하게 박힌 버튼 세 개. 같은 부품(ImageDrop · SlugField · 상태 머신)을 쓴다.
   두 화면이 다른 방식으로 같은 일을 하면, 고칠 때마다 한쪽만 고쳐진다. */
export default function WorkEditView(p: Props) {
  const { role } = useRole()
  const [title, setTitle] = useState(p.title)
  const [picked, setPicked] = useState<string[]>(p.builders)
  const [dirty, setDirty] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const touch = () => setDirty(true)

  const locked = !canEdit(p.status, role)
  const actions = allowedTransitions(p.status, role)

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
        {p.rejectReason && (
          <div className="notice notice--reject">
            <span className="notice__ico" aria-hidden="true">↩</span>
            <b>반려되었습니다</b>
            <p>{p.rejectReason}</p>
          </div>
        )}

        {locked && (
          <div className="notice notice--lock">
            <span className="notice__ico" aria-hidden="true">🔒</span>
            <b>검토 중입니다 — 지금은 수정할 수 없습니다</b>
            <p>
              제출한 건은 검수가 끝날 때까지 잠깁니다. 검수 중에 원본이 바뀌면 승인한 내용과
              공개된 내용이 달라지기 때문입니다. 고칠 곳을 찾았다면 관리자에게 반려를 요청하세요.
            </p>
            <p className="notice__hint">
              <span>화면 맨 위 “보는 사람”</span>
              <kbd>빌더</kbd>
              <span aria-hidden="true">→</span>
              <kbd>운영 관리자</kbd>
              <span>로 바꾸면 승인 · 반려가 보입니다</span>
            </p>
          </div>
        )}

        <fieldset className="adm-edit" disabled={locked}>
          <div>
            <div className="card">
              <div className="card__b">
                <div className="f">
                  <label htmlFor="ttl">프로젝트명 <span className="req">*</span></label>
                  <input id="ttl" name="title" type="text" value={title}
                    onChange={e => { setTitle(e.target.value); touch() }} />
                </div>
                <div className="f">
                  <label htmlFor="sum">개요 <span className="req">*</span> <span className="opt">목록 카드에 노출</span></label>
                  <textarea id="sum" name="excerpt" defaultValue={p.summary} onChange={touch} style={{ minHeight: 62 }} />
                </div>
                <div className="f2">
                  <div className="f">
                    <label htmlFor="tag">분야 <span className="req">*</span></label>
                    <input id="tag" name="tag" type="text" defaultValue={p.tag} onChange={touch}
                      placeholder="Commerce · AI · AX …" />
                  </div>
                  <div className="f">
                    <label htmlFor="yr">연도 <span className="req">*</span></label>
                    <input id="yr" name="year" type="text" defaultValue={p.year} onChange={touch} placeholder="2026" />
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
                  <textarea id="b1" name="bodyProblem" onChange={touch}
                    placeholder="클라이언트가 어떤 상황이었나 — 숫자가 있으면 숫자로" />
                </div>
                <div className="f">
                  <label htmlFor="b2">02 해결 <span className="req">*</span></label>
                  <textarea id="b2" name="bodySolution" onChange={touch}
                    placeholder="무엇을 어떻게 했나 · 어떤 판단을 내렸나" />
                </div>
                <div className="f">
                  <label htmlFor="b3">03 결과 <span className="req">*</span></label>
                  <textarea id="b3" name="bodyResult" onChange={touch}
                    placeholder="무엇이 달라졌나 · 다음 단계로 이어졌나" />
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
              <div className="card__h"><span>히어로 이미지 <span className="req">*</span></span></div>
              <div className="card__b">
                <ImageDrop name="cover" current={p.cover} spec="2400×1920px · 5:4" onDirty={touch} disabled={locked} />
                <p className="hint" style={{ marginTop: 10 }}>
                  목록 카드 · 상세 히어로 · 공유 카드(OG)에 같은 이미지가 쓰입니다.
                  지정하지 않으면 OG 는 기본 카드로 나갑니다.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card__h"><span>주소</span></div>
              <div className="card__b">
                <SlugField
                  name="slug" base="/work/" title={title} initial={p.slug}
                  published={p.status === 'published'} onDirty={touch} disabled={locked}
                  hint={
                    <>
                      <b>업종·기술 + 프로젝트명</b> 으로 씁니다. 한글을 그대로 씁니다.<br />
                      {/* 규칙 안내는 필수다 (FR-A05-03) — 고객사명이 URL 에 들어가면 되돌릴 수 없다 */}
                      ⚠ <b>고객사명은 넣지 않습니다</b> — 공개 동의를 확인한 건만 예외입니다.<br />
                      예 <code>커머스-리빙-리뉴얼</code> · <code>ai-업무플랫폼-daisy</code>
                    </>
                  }
                />
              </div>
            </div>

            <div className="card">
              <div className="card__h"><span>발행 설정</span></div>
              <div className="card__b">
                <div className="srow"><span className="k">수정일</span><span className="v num">{p.updated}</span></div>
                <div className="srow">
                  <span className="k">함께한 팀</span>
                  <span className="v">
                    <label className="chk">
                      <input type="checkbox" name="withPartner" defaultChecked={p.withPartner} onChange={touch} />
                      똑똑한개발자
                    </label>
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card__h"><span>SEO 메타 <span className="opt">선택</span></span></div>
              <div className="card__b">
                <div className="f">
                  <label htmlFor="st">검색 제목</label>
                  <input id="st" name="seoTitle" type="text" onChange={touch}
                    placeholder="비워두면 프로젝트명을 씁니다" />
                </div>
                <div className="f">
                  <label htmlFor="sd">검색 설명</label>
                  <textarea id="sd" name="seoDescription" onChange={touch} style={{ minHeight: 62 }}
                    placeholder="비워두면 개요에서 자동 생성됩니다" />
                </div>
              </div>
            </div>
          </div>
        </fieldset>

        {rejectOpen && (
          <div className="notice notice--reject" style={{ marginTop: 18 }}>
            <span className="notice__ico" aria-hidden="true">↩</span>
            <b>반려 사유 <span className="req">*</span></b>
            <textarea
              value={reason} autoFocus onChange={e => setReason(e.target.value)}
              placeholder="무엇을 고쳐야 하는지 구체적으로 적습니다. 작성자에게 그대로 표시됩니다."
              style={{ minHeight: 76, marginTop: 8 }}
            />
            <div className="notice__acts">
              <button type="button" className="abtn abtn--sm"
                onClick={() => { setRejectOpen(false); setReason('') }}>취소</button>
              <button type="button" className="abtn abtn--sm abtn--danger" disabled={reason.trim() === ''}>
                반려하고 사유 보내기
              </button>
            </div>
          </div>
        )}

        <div className="adm-actions">
          {locked ? (
            <span className="locked">🔒 검토 중이라 수정할 수 없습니다 · 관리자의 승인 또는 반려를 기다립니다</span>
          ) : (
            <span className="warn">
              {dirty
                ? '⚠ 저장하지 않은 변경이 있습니다 — 나가면 사라집니다'
                : 'Supabase 연결 전이라 아직 저장되지 않습니다'}
            </span>
          )}

          {!locked && <button className="abtn" type="button">임시저장</button>}

          {actions.map(t => (
            <button
              key={t.to}
              type="button"
              className={'abtn' + (t.to === 'published' ? ' abtn--lime' : t.needsReason ? ' abtn--danger' : '')}
              onClick={() => { if (t.needsReason) setRejectOpen(true) }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
