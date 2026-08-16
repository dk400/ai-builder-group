import { pendingQueue } from '../../_mock'
import ApprovalsView from './view'

/* A-07 승인 대기 — 관리자 전용. 빌더가 접근하면 403 이다 (FR-A07-05) */
export default function AdminApprovalsPage() {
  return <ApprovalsView rows={pendingQueue()} />
}
