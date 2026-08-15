import type { Metadata } from 'next'
import './style.css'
import Gnb from '@/components/Gnb'
import Footer from '@/components/Footer'
import SiteFx from '@/components/SiteFx'

/* 배포 주소를 코드에 박아두면 안 된다. 실제로 ai-builder-group-pearl(옛 HTML 목업 배포본)이
   박혀 있어서, 이 사이트를 공유해도 og:url · og:image 가 남의 도메인을 가리켰다.
   Vercel 이 빌드 때 넣어주는 프로덕션 도메인을 쓰고, 실도메인이 정해지면
   NEXT_PUBLIC_SITE_URL 만 채우면 된다. */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

const title = 'AI 빌더 그룹 — 바이브 코딩 외주'
const description =
  'AI 시대에 최적화된 개발자가 바이브 코딩으로 외주를 해드립니다. 기획부터 개발, 검수까지 검증된 빌더가 끝까지 맡습니다.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title,
    description,
    siteName: 'AI 빌더 그룹',
    locale: 'ko_KR',
    /* images 를 여기 적지 않는다 — app/opengraph-image.tsx 가 자동으로 채운다.
       둘 다 있으면 이쪽이 이겨서 파일 기반 카드가 무시된다. */
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
