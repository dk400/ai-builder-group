import { listInsights, statusCounts } from '../../_queries'
import { requireApprovedBuilderArea } from '../_area'
import InsightListView from '../insight/view'

/* 빌더 영역의 첫 화면 — 내가 쓴 글.

   관리자의 A-02(/admin/insight)와 **같은 화면 컴포넌트**를 쓴다. 범위는 화면이 아니라
   _queries 가 자른다(빌더면 author_id 로 .eq) — 같은 뷰를 써도 남의 글이 내려오지 않는다.
   base 를 넘겨 목록 안의 링크가 빌더 영역 밖으로 나가지 않게 한다. */
export default async function BuilderHomePage() {
  await requireApprovedBuilderArea()
  const rows = await listInsights()
  return <InsightListView rows={rows} counts={statusCounts(rows)} base="/admin/builder" />
}
