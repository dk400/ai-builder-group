'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { SPECIALTIES } from '@/app/_builders'

const OTHER = '__other__'

export type Profile = {
  slug: string
  no: string
  name: string
  avatar: string
  roleLabel: string        /* 전문 분야 — '랜딩 · 인터랙션'. SPECIALTIES 중 하나이거나 직접 입력값 */
  blurb: string            /* 카드 한 줄 소개 */
  bio: string              /* 프로필 본문 */
  focus: string
  stack: string[]
  principles: Array<[string, string]>
  email: string
  account: 'admin' | 'builder'
  active: boolean
  lastLogin: string
  done: number
}

/* A-06 프로필 편집 (FR-A06-04 — 슬러그·이름·한 줄 소개·역할·아바타).

   처음엔 어드민 목록과 같은 2열 폼으로 짰는데 무겁고 복잡했다. 이유가 셋이었다 —
   ① 빈 입력칸이 여섯 개 붙어 있었고(일하는 원칙), ② 사진이 오른쪽 세 번째 카드에 묻혀
   바꾸는 방법이 없었고, ③ 목록처럼 밀도를 올릴 이유가 없는 화면인데 2열을 썼다.

   그래서 한 사람이 자기 정보를 손보는 화면답게 고쳤다:
   · 720px 단일 열 — 표가 아니라 문서처럼 읽힌다
   · 사진을 맨 위 아이덴티티 줄로 끌어올리고 교체·삭제를 붙였다
   · 모든 칸을 실제 값으로 채운다. 빈 칸이 많을수록 할 일이 많아 보인다
   · 계정 정보는 읽기 전용이라 맨 아래 한 줄로 내렸다 */
export default function ProfileForm({ p, canEditAccount }: { p: Profile; canEditAccount: boolean }) {
  const [slug, setSlug] = useState(p.slug)
  const [stack, setStack] = useState(p.stack.join(', '))

  /* 저장된 값이 목록에 없으면 '기타'로 열어 둔 채 그 값을 그대로 보여 준다.
     목록에 없다고 값을 비워 버리면, 폼을 열기만 해도 프로필이 지워진다. */
  const known = (SPECIALTIES as readonly string[]).includes(p.roleLabel)
  const [spec, setSpec] = useState(known ? p.roleLabel : OTHER)
  const [specOther, setSpecOther] = useState(known ? '' : p.roleLabel)
  const [photo, setPhoto] = useState(p.avatar)
  const [photoName, setPhotoName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dirty, setDirty] = useState(false)
  const touch = () => setDirty(true)

  /* 고른 파일을 바로 미리 보여 준다. 업로드는 하지 않는다 — 목업이라 서버가 없다.
     objectURL 은 해제하지 않으면 탭이 살아 있는 동안 메모리에 남는다. */
  useEffect(() => {
    if (!photo.startsWith('blob:')) return
    return () => URL.revokeObjectURL(photo)
  }, [photo])

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setPhoto(URL.createObjectURL(f))
    setPhotoName(f.name)
    touch()
  }

  const resetPhoto = () => {
    setPhoto(p.avatar)
    setPhotoName(null)
    if (fileRef.current) fileRef.current.value = ''
    touch()
  }

  return (
    <div className="prof">
      {/* ── 아이덴티티 ── */}
      <div className="prof-hero">
        <div className="prof-ava">
          <img src={photo} alt={`${p.name} 프로필 사진`} />
          <label className="ov" htmlFor="avafile">사진 변경</label>
          <input ref={fileRef} id="avafile" type="file" accept="image/*" onChange={onPick}
            aria-label="프로필 사진 선택" />
        </div>
        <div className="prof-id">
          <b>{p.name}</b>
          <span>{p.roleLabel}</span>
          <div className="prof-ava__acts">
            <button className="abtn abtn--sm" type="button" onClick={() => fileRef.current?.click()}>
              사진 변경
            </button>
            {photoName && (
              <button className="abtn abtn--sm" type="button" onClick={resetPhoto}>되돌리기</button>
            )}
            <span className="note">
              {photoName ?? '상반신 인물 컷 · 밝은 배경 · 800×1000px (4:5)'}
            </span>
          </div>
        </div>
      </div>

      {/* ── 기본 정보 ── */}
      <section className="prof-sec">
        <h2>기본 정보</h2>
        <div className="f">
          <label htmlFor="name">이름 <span className="req">*</span></label>
          <input id="name" type="text" defaultValue={p.name} onChange={touch} />
          <p className="hint">사이트 전체에 이 표기가 나갑니다 — 빌더 카드 · 프로젝트 크레딧 · 매칭 결과.</p>
        </div>
        {/* 자유 입력이었는데, 이 값이 빌더 카드·프로젝트 크레딧·매칭 결과에 그대로 나가서
            표기가 조금만 흔들려도 목록이 지저분해진다. 정해진 목록에서 고르게 바꿨다. */}
        <div className="f">
          <label htmlFor="spec">전문 분야 <span className="req">*</span></label>
          <select id="spec" value={spec}
            onChange={e => { setSpec(e.target.value); touch() }}>
            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            <option value={OTHER}>기타 — 직접 입력</option>
          </select>
          {spec === OTHER && (
            <input type="text" value={specOther} style={{ marginTop: 8 }}
              onChange={e => { setSpecOther(e.target.value); touch() }}
              aria-label="전문 분야 직접 입력"
              placeholder="예) 리서치 · 사용성 테스트" />
          )}
          <p className="hint">
            빌더 카드와 프로젝트 크레딧에 이 표기가 나갑니다. 목록에 없는 영역이면 <b>기타</b>를 고르세요.
          </p>
        </div>
        <div className="f">
          <label htmlFor="blurb">한 줄 소개 <span className="req">*</span> <span className="opt">빌더 카드에 노출</span></label>
          <textarea id="blurb" defaultValue={p.blurb} onChange={touch} style={{ minHeight: 58 }} />
        </div>
        <div className="f">
          <label htmlFor="bio">소개 <span className="opt">프로필 상단 본문</span></label>
          <textarea id="bio" defaultValue={p.bio} onChange={touch} style={{ minHeight: 108 }} />
        </div>
        <div className="f2">
          {/* 위 '전문 분야'가 분류라면 이쪽은 실제로 맡는 일이다 — 둘 다 '전문 분야'라
              부르고 있어서 무엇을 적는 칸인지 알 수 없었다. 공개 프로필의 라벨도 함께 맞췄다. */}
          <div className="f">
            <label htmlFor="focus">주로 맡는 일</label>
            <input id="focus" type="text" defaultValue={p.focus} onChange={touch}
              placeholder="수주용 랜딩 · 브랜드 사이트" />
          </div>
          <div className="f">
            <label htmlFor="stack">주요 스택 <span className="opt">쉼표로 구분</span></label>
            <input id="stack" type="text" value={stack}
              onChange={e => { setStack(e.target.value); touch() }} />
            <p className="hint">카드에는 앞의 두 개만 나옵니다.</p>
          </div>
        </div>
      </section>

      {/* ── 일하는 원칙 ── */}
      <section className="prof-sec">
        <h2>일하는 원칙 <em>3개 고정</em></h2>
        {/* 공개 프로필이 3열 그리드라 개수가 셋으로 묶여 있다. 늘리려면 그쪽 레이아웃부터
            바꿔야 하므로 추가 버튼을 두지 않았다. */}
        {[0, 1, 2].map(i => {
          const pr = p.principles[i]
          return (
            <div className="prof-pr" key={i}>
              <span className="no">0{i + 1}</span>
              <div className="f">
                <input type="text" defaultValue={pr?.[0] ?? ''} onChange={touch}
                  aria-label={`원칙 ${i + 1} 제목`} placeholder="한 사람이 끝까지" />
              </div>
              <div className="f">
                <input type="text" defaultValue={pr?.[1] ?? ''} onChange={touch}
                  aria-label={`원칙 ${i + 1} 설명`} placeholder="한 문장으로 풀어 씁니다" />
              </div>
            </div>
          )
        })}
      </section>

      {/* ── 공개 주소 ── */}
      <section className="prof-sec">
        <h2>공개 주소</h2>
        <div className="f">
          <label htmlFor="bslug">슬러그 <span className="req">*</span></label>
          <div className="prof-slug">
            <div className="slug-row">
              <span className="pre">/builder?b=</span>
              <input id="bslug" type="text" value={slug}
                onChange={e => { setSlug(e.target.value); touch() }} />
            </div>
            <Link className="abtn abtn--sm" href={`/builder?b=${p.slug}`} target="_blank" rel="noopener noreferrer">
              열어보기 ↗
            </Link>
          </div>
          {/* 콘텐츠 슬러그와 달리 빌더는 아직 쿼리스트링이라 301 대상이 아니다.
              /builders/[slug] 로 승격되면(기획서 §14 Q6) 그때부터 리다이렉트가 필요하다. */}
          <p className="hint">영문 소문자. 프로젝트의 참여 빌더 칩이 이 주소를 가리킵니다.</p>
        </div>
      </section>

      {/* ── 계정 (읽기 전용) ── */}
      <section className="prof-sec prof-sec--acct">
        <h2>계정 <em>{canEditAccount ? '관리자만 변경' : '읽기 전용'}</em></h2>
        <dl className="prof-acct">
          <div><dt>이메일</dt><dd>{p.email}</dd></div>
          <div><dt>권한</dt><dd>{p.account === 'admin' ? 'ADMIN' : 'BUILDER'}</dd></div>
          <div><dt>상태</dt><dd>{p.active ? '활성' : '회수됨'}</dd></div>
          <div><dt>수행</dt><dd className="num">{p.done}건</dd></div>
          <div><dt>최근 로그인</dt><dd className="num">{p.lastLogin}</dd></div>
          <div><dt>시트 번호</dt><dd className="num">{p.no}</dd></div>
        </dl>
        {canEditAccount ? (
          <div className="prof-acct__acts">
            {p.active
              ? <button className="abtn abtn--sm abtn--danger" type="button">계정 회수</button>
              : <button className="abtn abtn--sm" type="button">계정 재발급</button>}
            <button className="abtn abtn--sm" type="button">비밀번호 재설정 메일</button>
          </div>
        ) : (
          <p className="hint">이메일·권한·계정 상태는 운영 관리자만 바꿀 수 있습니다.</p>
        )}
      </section>

      <div className="adm-actions">
        <span className="warn">
          {dirty
            ? '⚠ 저장하지 않은 변경이 있습니다 — 나가면 사라집니다 (FR-A00-07)'
            : '고친 내용은 공개 사이트의 빌더 프로필에 그대로 나갑니다'}
        </span>
        <button className="abtn abtn--lime" type="button">저장</button>
      </div>
    </div>
  )
}
