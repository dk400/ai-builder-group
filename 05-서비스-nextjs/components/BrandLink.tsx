'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MouseEvent } from 'react'

type Props = {
  /** GNB·푸터가 서로 다른 스타일을 쓰면 여기서 바꾼다 */
  className?: string
  /** 모바일 메뉴처럼 클릭과 함께 닫아야 할 것이 있으면 넘긴다 */
  onNavigate?: () => void
}

/**
 * 로고 = "홈 최상단으로".
 *
 * 다른 페이지에서는 Link 가 홈으로 보내고 App Router 가 알아서 최상단에 놓는다.
 * 홈에서는 라우팅이 일어나지 않아 스크롤 위치가 그대로 남으므로, 직접 올려준다.
 */
export default function BrandLink({ className = 'logo', onNavigate }: Props) {
  const pathname = usePathname()

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.()
    if (pathname !== '/') return
    /* 새 탭·새 창으로 열려는 클릭은 가로채지 않는다 */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return

    e.preventDefault()
    /* behavior 를 지정하지 않으면 CSS scroll-behavior 를 따른다 — reduce 환경에서는 즉시 이동 */
    window.scrollTo({ top: 0 })
    /* /#how 같은 해시로 들어와 있으면 지운다. 새로고침 시 다시 튀는 것을 막는다.
       state 를 보존해야 App Router 의 뒤로 가기가 깨지지 않는다. */
    if (window.location.hash) {
      window.history.replaceState(window.history.state, '', '/')
    }
  }

  return (
    <Link className={className} href="/" onClick={onClick} aria-label="AI빌더그룹 홈">
      <em>✳</em>AI빌더그룹
    </Link>
  )
}
