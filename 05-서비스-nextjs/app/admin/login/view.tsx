'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginView() {
  const router = useRouter()
  const [err, setErr] = useState(false)

  /* 실패 메시지는 사유를 구분하지 않는다 (FR-A01-03) — "없는 계정"과 "틀린 비밀번호"를
     구분해 주면 어떤 이메일이 등록돼 있는지 밖에서 알아낼 수 있다.
     목업에서는 이메일이 비어 있을 때만 그 메시지를 보여 준다. */
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email')
    if (!email) { setErr(true); return }
    router.push('/admin/insight')
  }

  return (
    <main id="main" className="adm-login">
      <form className="adm-login__card" onSubmit={onSubmit}>
        <div className="adm-login__brand"><em>✳</em>AI빌더그룹</div>
        {/* 페이지마다 h1 이 하나씩 있어야 한다 — 로그인 화면이라고 예외는 아니다 */}
        <h1>관리자 로그인</h1>
        <p className="lead">관리자 · 빌더 계정으로 로그인하세요.</p>

        <div className="f">
          <label htmlFor="email">이메일</label>
          <input id="email" name="email" type="email" placeholder="you@aibuildergroup.kr" autoComplete="username" />
        </div>
        <div className="f">
          <label htmlFor="pw">비밀번호</label>
          <input id="pw" name="pw" type="password" placeholder="••••••••" autoComplete="current-password" />
        </div>

        {err && (
          <p className="hint" style={{ color: '#A02D1F', margin: '0 0 14px' }} role="alert">
            이메일 또는 비밀번호가 올바르지 않습니다.
          </p>
        )}

        <button className="abtn abtn--ink" type="submit">로그인</button>

        {/* 자체 회원가입은 제공하지 않는다 (FR-A01-02) — 계정은 관리자가 A-06 에서 발급한다.
            비밀번호 재설정은 별도 화면 없이 이메일 링크 방식이다 (FR-A00-05). */}
        <p className="foot">
          계정은 관리자가 발급합니다 · <a href="mailto:contact@example.com">비밀번호 재설정 요청</a>
        </p>
      </form>
    </main>
  )
}
