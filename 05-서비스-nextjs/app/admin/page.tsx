import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { getViewer } from './_authz'

/* 어드민 루트는 **역할 분기점**이다.

   관리자는 /admin/insight, 빌더는 /admin/builder 로 간다. 미들웨어(proxy.ts)는 역할을
   보지 않기로 했으므로 — 역할이 DB 에 있어서 매 요청 조회해야 하고 세션은 낡을 수 있다 —
   로그인 직후 갈 곳을 정하는 판정이 여기 한 곳에 모인다.

   목업(키 없음)에서는 서버가 아는 역할이 없다. 그때는 로그인 화면으로 보낸다. */
export default async function AdminIndexPage() {
  if (!isSupabaseConfigured) redirect('/admin/login')

  const viewer = await getViewer()
  if (!viewer) redirect('/admin/login')

  redirect(viewer.role === 'admin' ? '/admin/insight' : '/admin/builder')
}
