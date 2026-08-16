import { adminBuilders } from '../../_mock'
import BuildersView from './view'

/* A-06 빌더 관리 — 관리자 전용 (P1) */
export default function AdminBuildersPage() {
  const rows = adminBuilders().map(b => ({
    slug: b.slug,
    name: b.name,
    email: b.email,
    role: b.accountRole,
    roleLabel: b.role,
    avatar: b.avatar,
    active: b.active,
    lastLogin: b.lastLogin,
    done: b.done,
  }))
  return <BuildersView rows={rows} />
}
