import { listPending } from '../../_queries'
import ApprovalsView from './view'

/* A-07 승인 대기 — 관리자 전용. 빌더가 접근하면 빈 큐다 (FR-A07-05).
   빈 목록으로 감추는 것이 아니라, 조회 단계에서 잘린다 — _queries.listPending 참조. */
export default async function AdminApprovalsPage() {
  return <ApprovalsView rows={await listPending()} />
}
