'use client'

import { signInWithGoogle, signInWithPassword } from './_actions'

type Props = {
  /** Supabase 키가 있는가. 없으면 화면 전체가 목업이다 */
  configured: boolean
  /** 로그인 후 돌아갈 곳. page.tsx 에서 이미 검사했다 */
  next: string
  /** 콜백에서 되돌아온 실패 문구 */
  error: string | null
  /** 같은 인증 폼을 역할별 진입 화면에서 재사용한다 */
  audience: 'admin' | 'builder'
}

export default function LoginView({ configured, next, error, audience }: Props) {
  const isBuilder = audience === 'builder'

  return (
    <main id="main" className="adm-login">
      <div className="adm-login__card">
        <div className="adm-login__brand"><em>✳</em>AI빌더그룹</div>
        {/* 페이지마다 h1 이 하나씩 있어야 한다 — 로그인 화면이라고 예외는 아니다 */}
        <h1>{isBuilder ? '빌더 로그인' : '관리자 로그인'}</h1>
        <p className="lead">
          {isBuilder ? '빌더 계정으로 작업 공간에 로그인하세요.' : '운영 관리자 계정으로 로그인하세요.'}
        </p>

        {error && (
          <p className="adm-login__err" role="alert">{error}</p>
        )}

        {/* 키가 없으면 인증이 통째로 꺼져 있다. 상단 목업 띠가 "동작하지 않는다"까지는
            알려 주지만, 처음 온 사람은 **무엇을 입력해야 하는지**를 모른다. 시연 링크를
            받은 사람이 로그인 화면에서 막히는 게 실제로 가장 흔한 이탈이다. */}
        {!configured && (
          <p className="adm-login__demo">
            <b className="t">시연용 목업입니다</b>
            아무 이메일·비밀번호를 넣어도 그대로 들어갑니다.
            들어간 뒤 화면 맨 위에서 <b>운영 관리자 ↔ 빌더 리아</b> 를 바꿔 가며 볼 수 있습니다.
          </p>
        )}

        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="loginPath" value={isBuilder ? '/builder/login' : '/admin/login'} />
          <button className="abtn abtn--google" type="submit">
            <GoogleMark />
            Google 계정으로 로그인
          </button>
        </form>
        <div className="adm-login__or"><span>또는</span></div>

        <form action={signInWithPassword}>
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="loginPath" value={isBuilder ? '/builder/login' : '/admin/login'} />
          <div className="f">
            <label htmlFor="email">이메일</label>
            <input id="email" name="email" type="email" placeholder="you@aibuildergroup.kr" autoComplete="username" required />
          </div>
          <div className="f">
            <label htmlFor="pw">비밀번호</label>
            <input id="pw" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required minLength={8} />
          </div>

          <button className="abtn abtn--ink" type="submit">로그인</button>
        </form>

        {/* '계정은 관리자가 발급합니다 · 비밀번호 재설정 요청' 줄은 뺐다.
            들어올 수 있는 사람은 이미 계정을 받은 사람이라 발급 안내를 읽을 일이 없고,
            계정이 없는 구글 로그인은 콜백이 "발급된 계정이 없습니다" 로 되돌려 준다.
            재설정 링크도 mailto: 자리표시자여서 실제로 닿는 곳이 없었다.

            ⚠ 이로써 비밀번호 재설정(FR-A00-05)의 화면 진입점이 하나도 남지 않는다.
              별도 화면을 만들지 않기로 한 조항이라, 되살릴 때도 이 자리에 링크 한 줄이다. */}
        <p className="foot">
          <a href={isBuilder ? '/admin/login' : '/builder/login'}>
            {isBuilder ? '관리자 로그인' : '빌더 로그인'}
          </a>
        </p>
      </div>
    </main>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01-2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  )
}
