import type { Metadata } from 'next'
import Link from 'next/link'
import './privacy.css'

export const metadata: Metadata = {
  title: '개인정보처리방침 — AI 빌더 그룹',
  openGraph: {
    title: '개인정보처리방침 — AI 빌더 그룹',
    url: 'https://ai-builder-group-pearl.vercel.app/privacy',
  },
}

const SECTIONS = [
  { no: '01', title: '수집하는 개인정보 항목', hold: '플레이스홀더 — pluug 문의 폼: 담당자명 · 연락처 · 이메일 · 문의 내용 등' },
  { no: '02', title: '수집·이용 목적', hold: '플레이스홀더 — 프로젝트 문의 응대 및 상담' },
  { no: '03', title: '보유·이용 기간', hold: '플레이스홀더' },
  { no: '04', title: '처리 위탁', hold: '플레이스홀더 — pluug(CRM) 위탁 처리 명시 필요' },
  { no: '05', title: '정보주체의 권리', hold: '플레이스홀더' },
  { no: '06', title: '개인정보 보호책임자', hold: '플레이스홀더' },
]

export default function PrivacyPage() {
  return (
    <main id="main">
      <div className="page-head">
        <div className="wrap">
          <Link className="backlink" href="/">홈으로</Link>
          <h1>개인정보처리방침</h1>
          <p>시행일: 2026. __. __.</p>
        </div>
      </div>

      <div className="doc">
        {SECTIONS.map(s => (
          <div key={s.no}>
            <h2><span className="no">{s.no}</span>{s.title}</h2>
            <div className="hold">{s.hold}</div>
          </div>
        ))}
        <p className="mono" style={{ fontSize: '11.5px', color: 'var(--muted-2)', marginTop: 42 }}>개정 이력: (자리 확보)</p>
      </div>
    </main>
  )
}
