import type { Metadata } from 'next'
import Link from 'next/link'
import { signUpBuilder } from './_actions'
import '../../admin/admin.css'

export const metadata: Metadata = {
  title: '빌더 계정 만들기 — AI 빌더 그룹',
  robots: { index: false, follow: false, nocache: true },
}

const ERRORS: Record<string, string> = {
  invalid: '입력값을 확인해 주세요. 비밀번호는 10자 이상이며 두 칸이 같아야 합니다.',
  exists: '이미 가입되었거나 승인 요청 중인 이메일입니다.',
  signup: '계정을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.',
}

export default async function BuilderSignupPage({ searchParams }: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const sp = await searchParams
  return (
    <div className="adm" style={{ '--adm-bar': '0px' } as React.CSSProperties}>
      <main id="main" className="adm-login">
        <div className="adm-login__card">
          <div className="adm-login__brand"><em>✳</em>AI빌더그룹</div>
          <h1>빌더 계정 만들기</h1>
          <p className="lead">계정을 만든 뒤 내 프로필을 작성하고 승인을 요청하세요.</p>

          {sp.error && <p className="adm-login__err" role="alert">{ERRORS[sp.error] ?? ERRORS.signup}</p>}
          {sp.success === 'check-email' ? (
            <div className="adm-login__demo">
              <b className="t">확인 메일을 보냈습니다</b>
              이메일 인증을 마친 뒤 빌더 로그인으로 들어가 프로필을 작성해 주세요.
            </div>
          ) : (
            <form action={signUpBuilder}>
              <div className="f"><label htmlFor="name">이름</label><input id="name" name="name" required minLength={2} maxLength={30} /></div>
              <div className="f"><label htmlFor="email">이메일</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
              <div className="f"><label htmlFor="password">비밀번호</label><input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" /></div>
              <div className="f"><label htmlFor="passwordConfirm">비밀번호 확인</label><input id="passwordConfirm" name="passwordConfirm" type="password" required minLength={10} autoComplete="new-password" /></div>
              <button className="abtn abtn--ink" type="submit">계정 만들기</button>
            </form>
          )}
          <p className="foot"><Link href="/builder/login">빌더 로그인으로 돌아가기</Link></p>
        </div>
      </main>
    </div>
  )
}
