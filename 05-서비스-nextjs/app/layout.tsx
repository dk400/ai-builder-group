import type { Metadata } from 'next'
import './style.css'
import Gnb from '@/components/Gnb'
import Footer from '@/components/Footer'
import SiteFx from '@/components/SiteFx'

export const metadata: Metadata = {
  metadataBase: new URL('https://ai-builder-group-pearl.vercel.app'),
  title: 'AI 빌더 그룹 — 바이브 코딩 외주',
  description:
    'AI 시대에 최적화된 개발자가 바이브 코딩으로 외주를 해드립니다. 기획부터 개발, 검수까지 검증된 빌더가 끝까지 맡습니다.',
  openGraph: {
    type: 'website',
    url: 'https://ai-builder-group-pearl.vercel.app/',
    title: 'AI 빌더 그룹 — 바이브 코딩 외주',
    description:
      'AI 시대에 최적화된 개발자가 바이브 코딩으로 외주를 해드립니다. 기획부터 개발, 검수까지 검증된 빌더가 끝까지 맡습니다.',
    siteName: 'AI 빌더 그룹',
    locale: 'ko_KR',
    images: [{ url: '/assets/img/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <a className="skip" href="#main">본문 바로가기</a>
        <Gnb />
        {children}
        <Footer />
        <SiteFx />
      </body>
    </html>
  )
}
