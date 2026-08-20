'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '../../ui'
import { useRole } from '../../../role'
import BodyEditor from '../../Editor'
import ImageDrop from '../../ImageDrop'
import SlugField from '../../SlugField'
import { allowedTransitions, canEdit, type Status } from '../../../_transitions'

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

/* A-03 Insight 편집.

   ⚠ 버튼을 상태와 무관하게 세 개(임시저장·제출·발행) 박아 두면 화면이 거짓말을 한다 —
     승인대기 중인 글에 "제출 → 승인대기"가 떠 있는 식이었다. 지금은 상태 머신
     (_transitions.ts)에서 **지금 이 상태에서 이 역할이 할 수 있는 것만** 그린다.
     서버와 DB 가 같은 표를 보므로 화면·요청·저장이 갈리지 않는다.

   ⚠ 상태 배지도 머리말과 사이드에 두 번 떠 있었다. 같은 정보를 두 곳에 두면 하나를
     고칠 때 다른 하나가 남는다. 머리말 한 곳만 남겼다. */
export default function InsightEditView(p: Props) {
  const { role } = useRole()
  const [title, setTitle] = useState(p.title)
  const [dirty, setDirty] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const touch = () => setDirty(true)

  /* DR-07 — 제출한 글은 작성자가 편집할 수 없다. 검수 중에 원본이 바뀌면
     승인한 것과 공개된 것이 달라진다. */
  const locked = !canEdit(p.status, role)
  const actions = allowedTransitions(p.status, role)

  return (
    <main id="main">
      <div className="adm-top">
        <div>
          <h1>{p.isNew ? '새 글 작성' : 'Insight 편집'}</h1>
          <p className="sub">
            <Link href="/admin/insight" style={{ color: 'inherit' }}>← 목록으로</Link>
            {!p.isNew && <> · {p.author} · 마지막 수정 {p.updated}</>}
          </p>
        </div>
        <div className="adm-top__r">
          <Badge status={p.status} />
        </div>
      </div>

      <div className="adm-body">
        {/* 반려된 글에는 사유가 반드시 붙어 있다 (FR-A07-04) — 무엇을 고칠지 알아야 다시 올린다 */}
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
              제출한 글은 검수가 끝날 때까지 잠깁니다. 검수 중에 원본이 바뀌면 승인한 내용과
              공개된 내용이 달라지기 때문입니다. 고칠 곳을 찾았다면 관리자에게 반려를 요청하세요 —
              반려되면 사유와 함께 다시 편집할 수 있습니다.
            </p>
            {/* 목업에서 "왜 아무것도 안 눌리지"의 실제 원인은 대부분 역할 스위치다.
                kbd 로 조판한다 — 조작부 라벨을 가리키는 태그이고, 제목용 b 규칙과 부딪히지 않는다.
                인증이 붙으면 이 줄과 스위치가 함께 사라진다. */}
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
          {/* ── 본문 ── */}
          <div>
            <div className="card">
              <div className="card__b">
                <div className="f">
                  <label htmlFor="ttl">제목 <span className="req">*</span></label>
                  <input
                    id="ttl" name="title" type="text" value={title}
                    onChange={e => { setTitle(e.target.value); touch() }}
                    placeholder="발주자가 검색할 표현으로 씁니다"
                  />
                </div>
                <div className="f">
                  <label htmlFor="exc">요약 <span className="opt">목록 카드와 검색 결과에 노출</span></label>
                  <textarea id="exc" name="excerpt" defaultValue={p.excerpt} onChange={touch}
                    style={{ minHeight: 62 }} placeholder="두 줄 이내로 씁니다" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card__h">
                <span>본문</span>
                <span>{p.bodyHtml ? '작성됨' : '비어 있음'}</span>
              </div>
              <div className="card__b">
                <BodyEditor name="bodyHtml" defaultValue={p.bodyHtml} onDirty={touch} editable={!locked} />
              </div>
            </div>
          </div>

          {/* ── 사이드 ── */}
          <div>
            <div className="card">
              <div className="card__h"><span>썸네일 <span className="req">*</span></span></div>
              <div className="card__b">
                <ImageDrop name="thumb" current={p.thumb} spec="800×450px · 16:9" onDirty={touch} disabled={locked} />
                <p className="hint" style={{ marginTop: 10 }}>
                  목록 카드 · 상세 커버 · 공유 카드(OG)에 같은 이미지가 쓰입니다.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card__h"><span>주소 · 분류</span></div>
              <div className="card__b">
                <SlugField
                  name="slug" base="/insight/" title={title} initial={p.slug}
                  published={p.status === 'published'} onDirty={touch} disabled={locked}
                />
                <div className="f">
                  <label htmlFor="cat">카테고리 <span className="req">*</span></label>
                  <select id="cat" name="cat" defaultValue={p.cat} onChange={touch}>
                    {p.cats.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card__h"><span>SEO 메타 <span className="opt">선택</span></span></div>
              <div className="card__b">
                <div className="f">
                  <label htmlFor="st">검색 제목</label>
                  <input id="st" name="seoTitle" type="text" onChange={touch}
                    placeholder="비워두면 제목을 그대로 씁니다" />
                </div>
                <div className="f">
                  <label htmlFor="sd">검색 설명</label>
                  <textarea id="sd" name="seoDescription" onChange={touch} style={{ minHeight: 62 }}
                    placeholder="비워두면 요약에서 자동 생성됩니다" />
                </div>
              </div>
            </div>
          </div>
        </fieldset>

        {/* 반려는 사유가 필수다 (FR-A07-04). 사유 없는 반려는 "안 됨"만 전달한다 */}
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
            /* 버튼이 사라진 자리에 이유를 둔다. 빈 바는 아무것도 설명하지 않는다 */
            <span className="locked">🔒 검토 중이라 수정할 수 없습니다 · 관리자의 승인 또는 반려를 기다립니다</span>
          ) : (
            <span className="warn">
              {dirty
                ? '⚠ 저장하지 않은 변경이 있습니다 — 나가면 사라집니다'
                : 'Supabase 연결 전이라 아직 저장되지 않습니다'}
            </span>
          )}

          {!locked && <button className="abtn" type="button">임시저장</button>}

          {/* 지금 상태에서 이 역할이 할 수 있는 것만 그린다.
              권한 없는 버튼은 비활성으로 보여주지 않고 아예 두지 않는다 —
              누를 수 없는 버튼은 "권한이 없다"가 아니라 "고장났다"로 읽힌다 */}
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
