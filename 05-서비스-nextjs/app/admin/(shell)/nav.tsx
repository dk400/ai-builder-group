'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Counts = { insight: number; work: number; approvals: number; builders: number }

/* 사이드바. 대시보드 항목이 없는 것은 의도다 — 로그인 후 첫 화면은 A-02(Insight 관리)이고
   별도 운영 대시보드는 범위 밖이다 (E10 · FR-A00-03). */
const NAV = [
  { href: '/admin/insight', icon: '✎', label: 'Insight 관리', key: 'insight' as const, sec: '콘텐츠' },
  { href: '/admin/work', icon: '▣', label: 'Work 관리', key: 'work' as const, sec: '콘텐츠' },
  { href: '/admin/approvals', icon: '✓', label: '승인 대기', key: 'approvals' as const, sec: '운영', hot: true },
  { href: '/admin/builders', icon: '☺', label: '빌더 관리', key: 'builders' as const, sec: '운영' },
]

export default function AdminNav({ counts }: { counts: Counts }) {
  const pathname = usePathname()
  let lastSec = ''

  return (
    <nav className="adm-nav" aria-label="관리자 메뉴">
      <div className="adm-nav__brand">
        <em>✳</em>AI빌더그룹<span>Admin</span>
      </div>

      {NAV.map(item => {
        const head = item.sec !== lastSec ? item.sec : null
        lastSec = item.sec
        /* /admin/insight/[id] 에서도 Insight 관리가 켜져 있어야 한다 */
        const on = pathname === item.href || pathname.startsWith(item.href + '/')
        const n = counts[item.key]
        return (
          <div key={item.href}>
            {head && <div className="adm-nav__sec">{head}</div>}
            <Link className={on ? 'on' : undefined} href={item.href}>
              <i aria-hidden="true">{item.icon}</i>
              {item.label}
              {/* 승인 대기 건수만 라임으로 세운다 — 여기만 사람이 뭔가 해야 하는 숫자다 */}
              <span className={'n' + (item.hot && n > 0 ? ' n--hot' : '')}>{n}</span>
            </Link>
          </div>
        )
      })}

      <div className="adm-nav__foot">
        {/* 로그아웃·비밀번호 재설정은 별도 화면을 만들지 않고 여기서 처리한다 (D2 · FR-A00-04·05) */}
        <div className="adm-who">
          <i aria-hidden="true">조</i>
          <span>
            <b>빌더 조쉬</b>
            <span>ADMIN</span>
          </span>
        </div>
        <Link href="/admin/login">
          <i aria-hidden="true">⇦</i>로그아웃
        </Link>
      </div>
    </nav>
  )
}
