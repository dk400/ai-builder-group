import LoginView from './view'

/* A-01 로그인 — 목업. 무엇을 입력해도 /admin/insight 로 넘어간다.
   실제 인증(Supabase Auth · FR-A01-01)과 미들웨어 게이트는 4단계다. */
export default function AdminLoginPage() {
  return <LoginView />
}
