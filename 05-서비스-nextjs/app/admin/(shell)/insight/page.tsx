import { listInsights, statusCounts } from '../../_queries'
import InsightListView from './view'

/* A-02 Insight 관리.
   데이터 원천은 _queries 가 감춘다 — 목업이든 Supabase 든 이 파일은 그대로다. */
export default async function AdminInsightPage() {
  const rows = await listInsights()
  return <InsightListView rows={rows} counts={statusCounts(rows)} />
}
