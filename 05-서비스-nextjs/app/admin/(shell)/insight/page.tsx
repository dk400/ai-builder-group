import { listInsights, statusCounts } from '../../_queries'
import { requireAdminArea } from '../_area'
import InsightListView from './view'

/* A-02 Insight 관리 (관리자 영역 — 전체 글).
   빌더의 '내 글'은 /admin/builder 다. 데이터 원천은 _queries 가 감춘다. */
export default async function AdminInsightPage() {
  await requireAdminArea()
  const rows = await listInsights()
  return <InsightListView rows={rows} counts={statusCounts(rows)} />
}
