import AdminNav from './nav'
import { adminInsights, adminWorks, pendingQueue, adminBuilders } from '../_mock'

/* 로그인(A-01)은 이 셸 밖에 있다 — 사이드바가 보이면 이미 들어온 것처럼 읽힌다.
   그래서 (shell) 라우트 그룹으로 묶었다. 그룹 이름은 주소에 나타나지 않는다. */
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const counts = {
    insight: adminInsights().length,
    work: adminWorks().length,
    approvals: pendingQueue().length,
    builders: adminBuilders().length,
  }
  return (
    <div className="adm-shell">
      <AdminNav counts={counts} />
      <div className="adm-main">{children}</div>
    </div>
  )
}
