import type { Metadata } from 'next'
import { pageMeta, SITE, SITE_URL } from './_meta'
import './style.css'
import Gnb from '@/components/Gnb'
import Footer from '@/components/Footer'
import SiteFx from '@/components/SiteFx'
import ChannelTalk from '@/components/ChannelTalk'

/* 배포 주소를 코드에 박아두면 안 된다. 실제로 ai-builder-group-pearl(옛 HTML 목업 배포본)이
   박혀 있어서, 이 사이트를 공유해도 og:url · og:image 가 남의 도메인을 가리켰다.
   값은 _meta.ts 의 SITE_URL 하나에서 나온다 — sitemap · robots 도 같은 값을 본다. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  /* 나머지 라우트와 같은 조립기를 쓴다 — 값이 한 곳에서만 나온다 */
  ...pageMeta({ title: `${SITE} — 바이브 코딩 외주`, path: '/' }),
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
        {/* 플러그인 키가 없으면 아무것도 하지 않는다 */}
        <ChannelTalk />
      </body>
    </html>
  )
}
