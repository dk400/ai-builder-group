'use client'

import Link from 'next/link'
import { useRole } from '../../../role'
import { Empty } from '../../ui'
import ProfileForm, { type Profile } from '../profile'

export default function BuilderProfilePage({ p }: { p: Profile }) {
  const { role, me } = useRole()
  const isAdmin = role === 'admin'

  /* 빌더가 남의 프로필 주소를 직접 치면 403 (FR-A06-05) */
  if (!isAdmin && p.slug !== me) {
    return (
      <main id="main">
        <div className="adm-top">
          <div>
            <h1>접근할 수 없습니다</h1>
            <p className="sub">403 — 다른 빌더의 프로필은 열 수 없습니다.</p>
          </div>
        </div>
        <div className="adm-body">
          <Empty title="본인 프로필만 수정할 수 있습니다" desc="왼쪽 메뉴의 '내 프로필'에서 계속하세요." />
        </div>
      </main>
    )
  }

  return (
    <main id="main">
      <div className="adm-top">
        <div>
          <h1>{isAdmin ? p.name : '내 프로필'}</h1>
          <p className="sub">
            {isAdmin && <Link href="/admin/accounts" style={{ color: 'inherit' }}>← 빌더 관리로</Link>}
            {isAdmin && ' · '}
            여기서 고친 내용은 공개 사이트의 빌더 프로필에 그대로 나갑니다.
          </p>
        </div>
        <div className="adm-top__r">
          <Link className="abtn" href={`/builder?b=${p.slug}`} target="_blank" rel="noopener noreferrer">
            공개 화면 보기 ↗
          </Link>
        </div>
      </div>
      <div className="adm-body">
        <ProfileForm p={p} canEditAccount={isAdmin} />
      </div>
    </main>
  )
}
