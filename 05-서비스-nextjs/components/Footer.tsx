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
          <Link href="/privacy">개인정보처리방침</Link>
        </div>
      </div>
    </footer>
  )
}
