'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signInWithGoogle } from './_actions'

type Props = {
  /** Supabase 키가 있는가. 없으면 화면 전체가 목업이다 */
  configured: boolean
  /** 로그인 후 돌아갈 곳. page.tsx 에서 이미 검사했다 */
  next: string
  /** 콜백에서 되돌아온 실패 문구 */
  error: string | null
}

export default function LoginView({ configured, next, error }: Props) {
  const router = useRouter()
  const [err, setErr] = useState(false)

  /* 실패 메시지는 사유를 구분하지 않는다 (FR-A01-03) — "없는 계정"과 "틀린 비밀번호"를
     구분해 주면 어떤 이메일이 등록돼 있는지 밖에서 알아낼 수 있다.
     목업에서는 이메일이 비어 있을 때만 그 메시지를 보여 준다. */
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email')
    if (!email) { setErr(true); return }
    router.push(next)
  }

  return (
    <main id="main" className="adm-login">
      <div className="adm-login__card">
        <div className="adm-login__brand"><em>✳</em>AI빌더그룹</div>
        {/* 페이지마다 h1 이 하나씩 있어야 한다 — 로그인 화면이라고 예외는 아니다 */}
        <h1>관리자 로그인</h1>
        <p className="lead">관리자 · 빌더 계정으로 로그인하세요.</p>

        {error && (
          <p className="adm-login__err" role="alert">{error}</p>
        )}

        {/* 구글 로그인을 위에 둔다 — 실제로 동작하는 쪽이고, 비밀번호를 새로 외우지 않아도 된다.
            서버 액션 폼이라 브라우저는 Supabase 를 직접 부르지 않는다 (DR-02). */}
        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <button className="abtn abtn--google" type="submit">
            <GoogleMark />
            Google 계정으로 로그인
          </button>
        </form>
        {!configured && (
          <p className="hint adm-login__mock">
            지금은 목업입니다 — 눌러도 구글로 가지 않고 바로 들어갑니다.
          </p>
        )}

        <div className="adm-login__or"><span>또는</span></div>

        <form onSubmit={onSubmit}>
          <div className="f">
            <label htmlFor="email">이메일</label>
            <input id="email" name="email" type="email" placeholder="you@aibuildergroup.kr" autoComplete="username" />
          </div>
          <div className="f">
            <label htmlFor="pw">비밀번호</label>
            <input id="pw" name="pw" type="password" placeholder="••••••••" autoComplete="current-password" />
          </div>

          {err && (
            <p className="adm-login__err" role="alert">
              이메일 또는 비밀번호가 올바르지 않습니다.
            </p>
          )}

          <button className="abtn abtn--ink" type="submit">로그인</button>
        </form>

        {/* 자체 회원가입은 제공하지 않는다 (FR-A01-02) — 계정은 관리자가 A-06 에서 발급한다.
            비밀번호 재설정은 별도 화면 없이 이메일 링크 방식이다 (FR-A00-05). */}
        <p className="foot">
          계정은 관리자가 발급합니다 · <a href="mailto:contact@example.com">비밀번호 재설정 요청</a>
        </p>
      </div>
    </main>
  )
}

/* 구글 브랜딩 가이드가 버튼에 이 마크를 요구한다. 4색 G 는 구글 로그인 버튼에 쓰라고
   배포된 공식 마크이고, 이 저장소 하드 룰 4(동의 없는 고객사 로고 금지)의 대상이 아니다.
   외부 요청 없이 인라인으로 그린다 — 로그인 화면이 서드파티 CDN 을 기다릴 이유가 없다. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  )
}
