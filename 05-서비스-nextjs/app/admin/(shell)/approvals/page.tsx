import { listPending } from '../../_queries'
import { requireAdminArea } from '../_area'
import ApprovalsView from './view'

/* A-07 승인 대기 — 관리자 전용. 빌더가 주소를 직접 치면 자기 영역으로 돌아간다 (FR-A07-05).
   화면에서 감추는 것이 차단은 아니므로 조회도 잘린다 — _queries.listPending 참조. */
export default async function AdminApprovalsPage() {
  await requireAdminArea()
  return <ApprovalsView rows={await listPending()} />
}
