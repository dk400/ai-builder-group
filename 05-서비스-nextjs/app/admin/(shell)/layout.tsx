import AdminNav from './nav'
import { adminInsights, adminWorks, pendingQueue, adminBuilders, BUILDER_ME } from '../_mock'

/* 로그인(A-01)은 이 셸 밖에 있다 — 사이드바가 보이면 이미 들어온 것처럼 읽힌다.
   그래서 (shell) 라우트 그룹으로 묶었다. 그룹 이름은 주소에 나타나지 않는다.

   역할별 건수를 둘 다 내려보낸다. 역할 전환이 클라이언트에 있어서(목업 한정) 서버에서는
   어느 쪽을 쓸지 모른다. 실제 구현에서는 서버가 세션을 보고 한 벌만 계산한다. */
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const ins = adminInsights()
  const wk = adminWorks()

  const counts = {
    insight: ins.length,
    work: wk.length,
    approvals: pendingQueue().length,
    builders: adminBuilders().length,
  }
  const myCounts = {
    insight: ins.filter(a => a.owner === BUILDER_ME).length,
    work: wk.filter(w => w.owner === BUILDER_ME).length,
    approvals: 0,
    builders: 1,
  }

  return (
    <div className="adm-shell">
      <AdminNav counts={counts} myCounts={myCounts} />
      <div className="adm-main">{children}</div>
    </div>
  )
}
