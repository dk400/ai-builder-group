'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRole } from '../role'
import { signOut } from '../login/_actions'

type Counts = { insight: number; work: number; approvals: number; builders: number }

/* 사이드바. 대시보드 항목이 없는 것은 의도다 — 로그인 후 첫 화면은 A-02(Insight 관리)이고
   별도 운영 대시보드는 범위 밖이다 (E10 · FR-A00-03).

   빌더로 보면 '승인 대기'가 사라지고 '빌더 관리'가 '내 프로필'이 된다 (PRD §2.2).
   메뉴에서 감추는 것은 안내일 뿐이고, 실제 차단은 서버가 한다 (FR-A07-05 — 빌더 접근 403). */
const NAV = [
  { href: '/admin/insight', icon: '✎', label: 'Insight 관리', key: 'insight' as const, sec: '콘텐츠' },
  { href: '/admin/work', icon: '▣', label: 'Work 관리', key: 'work' as const, sec: '콘텐츠' },
  { href: '/admin/approvals', icon: '✓', label: '승인 대기', key: 'approvals' as const, sec: '운영', adminOnly: true, hot: true },
  { href: '/admin/builders', builderHref: '/admin/profile', icon: '☺', label: '빌더 관리', key: 'builders' as const, sec: '운영', builderLabel: '내 프로필' },
]

export default function AdminNav({ counts, myCounts }: { counts: Counts; myCounts: Counts }) {
  const pathname = usePathname()
  const { role, name } = useRole()
  const isAdmin = role === 'admin'
  const n = isAdmin ? counts : myCounts
  let lastSec = ''

  return (
    <nav className="adm-nav" aria-label="관리자 메뉴">
      <div className="adm-nav__brand">
        <em>✳</em>AI빌더그룹<span>Admin</span>
      </div>

      {NAV.filter(item => isAdmin || !item.adminOnly).map(item => {
        const head = item.sec !== lastSec ? item.sec : null
        lastSec = item.sec
        /* /admin/insight/[id] 에서도 Insight 관리가 켜져 있어야 한다 */
        const href = !isAdmin && item.builderHref ? item.builderHref : item.href
        const on = pathname === href || pathname.startsWith(href + '/')
        const count = n[item.key]
        const label = !isAdmin && item.builderLabel ? item.builderLabel : item.label
        return (
          <div key={item.href}>
            {head && <div className="adm-nav__sec">{head}</div>}
            <Link className={on ? 'on' : undefined} href={href}>
              <i aria-hidden="true">{item.icon}</i>
              {label}
              {/* 승인 대기 건수만 라임으로 세운다 — 여기만 사람이 뭔가 해야 하는 숫자다 */}
              {!(item.key === 'builders' && !isAdmin) && (
                <span className={'n' + (item.hot && count > 0 ? ' n--hot' : '')}>{count}</span>
              )}
            </Link>
          </div>
        )
      })}

      <div className="adm-nav__foot">
        {/* 로그아웃·비밀번호 재설정은 별도 화면을 만들지 않고 여기서 처리한다 (D2 · FR-A00-04·05) */}
        <div className="adm-who">
          <i aria-hidden="true">{name.trim().charAt(0) || (isAdmin ? '관' : '빌')}</i>
          <span>
            <b>{name}</b>
            <span>{isAdmin ? 'ADMIN' : 'BUILDER'}</span>
          </span>
        </div>
        <form action={signOut}>
          <button className="adm-nav__logout" type="submit">
            <i aria-hidden="true">←</i>로그아웃
          </button>
        </form>
      </div>
    </nav>
  )
}
