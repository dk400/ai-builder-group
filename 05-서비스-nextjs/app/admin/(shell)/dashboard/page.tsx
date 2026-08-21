import { listInsights, listPending, listWorks } from '../../_queries'
import { requireAdminArea } from '../_area'
import DashboardView from './view'
import './dashboard.css'

/* 운영 현황 대시보드 (관리자 영역).

   원작자 설계엔 없던 화면이다(E10 · FR-A00-03 은 첫 화면을 A-02 로 두고 별도 대시보드를
   범위 밖으로 뒀다). 요청으로 추가하되 새 파일로만 얹고, 데이터는 목록과 같은 _queries 만
   집계한다 — 진실 공급원을 늘리지 않는다. 로그인 후 기본 진입점은 그대로 A-02 이고,
   여기는 사이드바에서 한 번 눌러 들어온다. */
export default async function AdminDashboardPage() {
  await requireAdminArea()
  const [works, insights, pending] = await Promise.all([listWorks(), listInsights(), listPending()])
  return <DashboardView works={works} insights={insights} pending={pending} base="/admin" />
}
