import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import AdminNav from './nav'
import { navCounts } from '../_queries'
import { getViewer } from '../_authz'

/* 로그인(A-01)은 이 셸 밖에 있다 — 사이드바가 보이면 이미 들어온 것처럼 읽힌다.
   그래서 (shell) 라우트 그룹으로 묶었다. 그룹 이름은 주소에 나타나지 않는다.

   어드민은 세션을 읽으므로 정적 생성 대상이 아니다. 빌드 시점에 만들어 두면 로그인한
   사람과 상관없이 같은 화면이 나간다 — 공개 13라우트의 정적 생성과는 다른 이야기다. */
export const dynamic = 'force-dynamic'

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const viewer = isSupabaseConfigured ? await getViewer() : null
  if (isSupabaseConfigured && !viewer) redirect('/admin/login')
  if (viewer && viewer.role !== 'admin' && viewer.approval !== 'approved') redirect('/admin/profile')
  const { counts, myCounts } = await navCounts()
  return (
    <div className="adm-shell">
      <AdminNav counts={counts} myCounts={myCounts} />
      <div className="adm-main">{children}</div>
    </div>
  )
}
