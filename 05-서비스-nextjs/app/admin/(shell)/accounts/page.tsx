import { adminBuilders } from '../../_mock'
import BuildersView from './view'
import type { Profile } from './profile'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { listBuilderApplications } from '../../_queries'
import { getViewer } from '../../_authz'
import { requireAdminArea } from '../_area'
import { redirect } from 'next/navigation'

/* A-06 빌더 관리.
   관리자는 계정 목록을, 빌더는 본인 프로필 편집 폼을 본다 (FR-A06-05).
   역할 전환이 클라이언트에 있어(목업 한정) 두 경우의 데이터를 모두 내려보낸다. */
export default async function AdminBuildersPage() {
  const all = adminBuilders()

  const rows = all.map(b => ({
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

  const profiles: Profile[] = all.map(b => ({
    slug: b.slug,
    no: b.no,
    name: b.name,
    avatar: b.avatar,
    roleLabel: b.role,
    blurb: b.blurb,
    bio: b.bio,
    focus: b.focus,
    stack: b.stack,
    principles: b.principles,
    email: b.email,
    account: b.accountRole,
    active: b.active,
    lastLogin: b.lastLogin,
    done: b.done,
  }))

  const viewer = isSupabaseConfigured ? await getViewer() : null
  /* 빌더는 자기 영역(/admin/builder)으로 돌아간다 — 판정은 _area 한 곳에 모아 뒀다 */
  await requireAdminArea()
  const applications = viewer?.role === 'admin' ? await listBuilderApplications() : []
  return <BuildersView rows={rows} profiles={profiles} applications={applications} />
}
