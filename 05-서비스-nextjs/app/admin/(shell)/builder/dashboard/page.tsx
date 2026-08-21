import { listInsights, listWorks } from '../../../_queries'
import { requireApprovedBuilderArea } from '../../_area'
import DashboardView from '../../dashboard/view'
import '../../dashboard/dashboard.css'

/* 빌더 영역 대시보드 — 내 콘텐츠 현황.

   관리자 대시보드와 **같은 뷰 컴포넌트**를 쓴다. 범위는 화면이 아니라 _queries 가 자르고
   (빌더면 author_id · created_by 로 .eq), base 를 넘겨 링크가 빌더 영역 밖으로 안 나가게 한다.
   빌더에게는 전역 승인 큐가 없으므로(FR-A07-05) 검수 대기 목록은 넘기지 않는다 — 빈 배열이면
   뷰가 '지금 할 일'(내 반려·초안)로 바뀐다. */
export default async function BuilderDashboardPage() {
  await requireApprovedBuilderArea()
  const [works, insights] = await Promise.all([listWorks(), listInsights()])
  return <DashboardView works={works} insights={insights} pending={[]} base="/admin/builder" />
}
