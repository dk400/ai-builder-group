import { listWorks, statusCounts } from '../../../_queries'
import { requireApprovedBuilderArea } from '../../_area'
import WorkListView from '../../work/view'

/* 빌더 영역 — 내가 리드인 프로젝트. 이유는 ../page.tsx 주석과 같다 */
export default async function BuilderWorkPage() {
  await requireApprovedBuilderArea()
  const rows = await listWorks()
  return <WorkListView rows={rows} counts={statusCounts(rows)} base="/admin/builder" />
}
