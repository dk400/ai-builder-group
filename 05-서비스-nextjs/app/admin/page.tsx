import { redirect } from 'next/navigation'

/* 어드민 루트는 로그인 진입점으로 고정한다. Supabase 키가 없는 목업 환경에서도
   주소창에 /admin 을 입력하면 먼저 로그인 화면을 보게 한다. */
export default function AdminIndexPage() {
  redirect('/admin/login')
}
