import { listWorks, statusCounts } from '../../_queries'
import WorkListView from './view'

/* A-04 Work 관리 */
export default async function AdminWorkPage() {
  const rows = await listWorks()
  return <WorkListView rows={rows} counts={statusCounts(rows)} />
}
