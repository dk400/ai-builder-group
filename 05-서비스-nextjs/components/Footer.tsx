import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="ft6">
          <div className="ft6__brand">
            <Link className="logo" href="/"><em>✳</em>AI빌더그룹</Link>
            <p>AI 시대에 최적화된 바이브코딩 외주 전문 그룹</p>
          </div>
          <div className="col">
            <b>Service</b>
            <Link href="/work">Work</Link>
            <Link href="/insight">Insight</Link>
            <Link href="/content">콘텐츠</Link>
          </div>
          <div className="col">
            <b>Company</b>
            <Link href="/#how">일하는 방식</Link>
            <Link href="/#faq">FAQ</Link>
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
        <p className="ft__legal">
          <b>AI 빌더 그룹</b> · 사업자 정보는 사이트 오픈과 함께 게재됩니다.<br />
          이메일 문의는 pluug 장애 대비 대체 경로입니다.
        </p>
        <div className="ft__bottom">
          <span>© 2026 AI Builder Group</span>
          <Link href="/privacy">개인정보처리방침</Link>
        </div>
      </div>
    </footer>
  )
}
