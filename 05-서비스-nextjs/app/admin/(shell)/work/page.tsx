import { listWorks, statusCounts } from '../../_queries'
import { requireAdminArea } from '../_area'
import WorkListView from './view'

/* A-04 Work 관리 (관리자 영역 — 전체). 빌더의 '내 프로젝트'는 /admin/builder/work 다 */
export default async function AdminWorkPage() {
  await requireAdminArea()
  const rows = await listWorks()
  return <WorkListView rows={rows} counts={statusCounts(rows)} />
}
