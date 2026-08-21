import { notFound } from 'next/navigation'
import { BUILDERS } from '@/app/_builders'
import { adminBuilders } from '../../../_mock'
import BuilderProfilePage from './view'
import type { Profile } from '../profile'

/* 개별 빌더 프로필 편집. 관리자는 누구든 열 수 있고, 빌더는 본인 것만 (FR-A06-05).
   빌더가 남의 주소로 들어오면 403 이다 — 판정은 실제로는 서버가 한다. */
export function generateStaticParams() {
  return BUILDERS.map(b => ({ slug: b.slug }))
}

export default async function AdminBuilderProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const b = adminBuilders().find(x => x.slug === slug)
  if (!b) notFound()

  const profile: Profile = {
    slug: b.slug, no: b.no, name: b.name, avatar: b.avatar, roleLabel: b.role,
    blurb: b.blurb, bio: b.bio, focus: b.focus, stack: b.stack, principles: b.principles,
    email: b.email, account: b.accountRole, active: b.active, lastLogin: b.lastLogin, done: b.done,
  }
  return <BuilderProfilePage p={profile} />
}
