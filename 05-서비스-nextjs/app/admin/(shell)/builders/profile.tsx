'use client'

import Link from 'next/link'
import { useState } from 'react'

export type Profile = {
  slug: string
  no: string
  name: string
  avatar: string
  roleLabel: string        /* 직함 한 줄 — '랜딩 · 인터랙션' */
  blurb: string            /* 카드 한 줄 소개 */
  bio: string              /* 프로필 본문 */
  focus: string
  stack: string[]
  email: string
  account: 'admin' | 'builder'
  active: boolean
  lastLogin: string
  done: number
}

/* A-06 프로필 편집 (FR-A06-04 — 슬러그·이름·한 줄 소개·역할·아바타).

   이메일과 권한은 읽기 전용이다. 계정 발급·회수는 관리자만 하고(FR-A06-02·03),
   관리자 승격은 화면에서 아예 할 수 없다(PRD §2.2 — DB 직접 변경만). 그래서 편집 가능한
   필드와 아닌 필드를 카드로 갈라 놓았다 — 한 폼에 섞으면 무엇이 내 권한인지 알 수 없다. */
export default function ProfileForm({ p, canEditAccount }: { p: Profile; canEditAccount: boolean }) {
  const [slug, setSlug] = useState(p.slug)
  const [stack, setStack] = useState(p.stack.join(', '))
  const [dirty, setDirty] = useState(false)
  const touch = () => setDirty(true)

  return (
    <>
      <div className="adm-edit">
        {/* ── 공개 프로필 ── */}
        <div>
          <div className="card">
            <div className="card__h"><span>공개 프로필</span><span>{p.no}</span></div>
            <div className="card__b">
              <div className="f">
                <label htmlFor="name">이름 <span className="req">*</span></label>
                <input id="name" type="text" defaultValue={p.name} onChange={touch} />
                <p className="hint">사이트 전체에 이 표기가 나갑니다 — 목록 카드 · 프로젝트 크레딧 · 매칭 결과.</p>
              </div>
              <div className="f">
                <label htmlFor="role">직함 <span className="req">*</span></label>
                <input id="role" type="text" defaultValue={p.roleLabel} onChange={touch}
                  placeholder="랜딩 · 인터랙션" />
              </div>
              <div className="f">
                <label htmlFor="blurb">한 줄 소개 <span className="req">*</span> <span className="opt">빌더 카드에 노출</span></label>
                <textarea id="blurb" defaultValue={p.blurb} onChange={touch} style={{ minHeight: 62 }} />
              </div>
              <div className="f">
                <label htmlFor="bio">소개 <span className="opt">프로필 상단 본문</span></label>
                <textarea id="bio" defaultValue={p.bio} onChange={touch} style={{ minHeight: 110 }} />
              </div>
              <div className="f2">
                <div className="f">
                  <label htmlFor="focus">전문 분야</label>
                  <input id="focus" type="text" defaultValue={p.focus} onChange={touch} />
                </div>
                <div className="f">
                  <label htmlFor="stack">주요 스택 <span className="opt">쉼표로 구분 · 카드엔 앞 두 개</span></label>
                  <input id="stack" type="text" value={stack}
                    onChange={e => { setStack(e.target.value); touch() }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__h"><span>일하는 원칙</span><span>3개 고정</span></div>
            <div className="card__b">
              {/* 프로필 화면이 세 칸 그리드라 개수가 셋으로 고정돼 있다.
                  늘리려면 공개 화면 레이아웃부터 바꿔야 하므로 추가 버튼을 두지 않았다. */}
              <p className="hint" style={{ margin: '0 0 14px' }}>
                프로필 화면이 3열 그리드라 항목 수는 셋으로 고정입니다.
              </p>
              {[1, 2, 3].map(i => (
                <div className="f2" key={i} style={{ marginBottom: 14 }}>
                  <div className="f" style={{ marginBottom: 0 }}>
                    <label htmlFor={`pt${i}`}>0{i} 제목</label>
                    <input id={`pt${i}`} type="text" onChange={touch} placeholder="한 사람이 끝까지" />
                  </div>
                  <div className="f" style={{ marginBottom: 0 }}>
                    <label htmlFor={`pd${i}`}>0{i} 설명</label>
                    <input id={`pd${i}`} type="text" onChange={touch} placeholder="한 문장으로" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 사이드 ── */}
        <div>
          <div className="card">
            <div className="card__h"><span>계정</span><span>{canEditAccount ? '관리자' : '읽기 전용'}</span></div>
            <div className="card__b">
              <div className="srow"><span className="k">이메일</span><span className="v" style={{ fontWeight: 600 }}>{p.email}</span></div>
              <div className="srow">
                <span className="k">권한</span>
                <span className="v">
                  <span className={'st ' + (p.account === 'admin' ? 'st--published' : '')}>
                    {p.account === 'admin' ? 'ADMIN' : 'BUILDER'}
                  </span>
                </span>
              </div>
              <div className="srow">
                <span className="k">상태</span>
                <span className="v">
                  <span className={'st ' + (p.active ? 'st--published' : 'st--archived')}>{p.active ? '활성' : '회수됨'}</span>
                </span>
              </div>
              <div className="srow"><span className="k">수행</span><span className="v num">{p.done}건</span></div>
              <div className="srow"><span className="k">최근 로그인</span><span className="v num">{p.lastLogin}</span></div>
              {!canEditAccount && (
                <p className="hint" style={{ marginTop: 12 }}>
                  이메일·권한·계정 상태는 운영 관리자만 바꿀 수 있습니다. 변경이 필요하면 요청해 주세요.
                </p>
              )}
              {canEditAccount && (
                <div style={{ display: 'flex', gap: 7, marginTop: 14 }}>
                  {p.active
                    ? <button className="abtn abtn--sm abtn--danger" type="button">계정 회수</button>
                    : <button className="abtn abtn--sm" type="button">계정 재발급</button>}
                  <button className="abtn abtn--sm" type="button">비밀번호 재설정 메일</button>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card__h"><span>사진</span></div>
            <div className="card__b">
              <div className="drop drop--avatar">
                <img src={p.avatar} alt="" />
              </div>
              <p className="hint" style={{ marginTop: 10 }}>
                상반신 인물 컷 · 밝은 배경 통일 · <b>800×1000px · 4:5</b>
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card__h"><span>공개 주소</span></div>
            <div className="card__b">
              <div className="f">
                <label htmlFor="bslug">슬러그 <span className="req">*</span></label>
                <div className="slug-row">
                  <span className="pre">/builder?b=</span>
                  <input id="bslug" type="text" value={slug}
                    onChange={e => { setSlug(e.target.value); touch() }} />
                </div>
                {/* 콘텐츠 슬러그와 달리 빌더는 아직 쿼리스트링이라 301 대상이 아니다.
                    /builders/[slug] 로 승격되면(기획서 §14 Q6) 그때부터 리다이렉트가 필요하다. */}
                <p className="hint">
                  영문 소문자로 씁니다. 프로젝트의 참여 빌더 칩이 이 주소를 가리킵니다.
                </p>
              </div>
              <Link className="abtn abtn--sm" href={`/builder?b=${p.slug}`} target="_blank" rel="noopener noreferrer">
                공개 프로필 보기 ↗
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="adm-actions">
        <span className="warn">
          {dirty
            ? '⚠ 저장하지 않은 변경이 있습니다 — 나가면 사라집니다 (FR-A00-07)'
            : '여기서 고친 내용은 공개 사이트의 빌더 프로필에 그대로 나갑니다'}
        </span>
        <button className="abtn abtn--lime" type="button">저장</button>
      </div>
    </>
  )
}
