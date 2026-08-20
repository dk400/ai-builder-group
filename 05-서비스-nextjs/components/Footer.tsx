import Link from 'next/link'

import BrandLink from './BrandLink'

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="ft6">
          <div className="ft6__brand">
            <BrandLink />
            <p>AI 시대에 최적화된 바이브코딩 외주 전문 그룹</p>
          </div>
          <div className="col">
            <b>Service</b>
            <Link href="/work">Work</Link>
            <Link href="/insight">Insight</Link>
            <Link href="/content">Content</Link>
          </div>
          <div className="col">
            <b>Company</b>
            <Link href="/#how">일하는 방식</Link>
            <Link href="/faq">FAQ</Link>
            <span className="soon">채용 (준비 중)</span>
          </div>
          <div className="col">
            <b>Contact</b>
            <Link href="/contact">프로젝트 문의</Link>
            <a href="mailto:contact@example.com">contact@_______</a>
          </div>
          <div className="col">
            <b>Social</b>
            <Link href="/content">YouTube</Link>
            <span className="soon">Instagram (예정)</span>
            <span className="soon">LinkedIn (예정)</span>
          </div>
        </div>
        <div className="ft__bottom">
          <span>© 2026 AI Builder Group</span>
          {/* 링크를 한 덩어리로 묶는다 — space-between 이라 그냥 늘어놓으면 셋이 균등 분산된다 */}
          <span className="ft__util">
            <Link href="/privacy">개인정보처리방침</Link>
            {/* 관리자 진입점. FR-C-05 의 인수 조건("공개 HTML 에 /admin 0건")을 벗어나는
                의도된 예외다 — 검수 중 어드민에 바로 들어갈 통로가 필요하다는 요청.
                GNB 에는 넣지 않는다(요구사항 본문). /admin 은 noindex + robots 차단이라
                색인에는 영향이 없고, 서버 차단은 미들웨어 게이트(FR-A00-01)가 붙을 때 생긴다. */}
            <Link href="/admin">관리자</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
