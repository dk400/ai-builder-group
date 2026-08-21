import type { MetadataRoute } from 'next'
import { SITE_URL } from './_meta'

/* robots.txt 가 없으면 404 가 나가고, 크롤러는 "제한 없음"으로 해석한다. 동작은 같지만
   사이트맵 위치를 알려줄 자리가 사라진다 — 이 파일의 실제 목적은 그쪽이다. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      /* 내부 문서와 관리자. 페이지 metadata 에도 noindex 를 걸어 뒀지만,
         크롤 자체를 막아 두면 색인 후보에도 오르지 않는다.
         /admin 은 FR-A00-02 가 noindex + robots 차단 + sitemap 제외 세 겹을 요구한다.
         /preview 는 승인 전 원본을 공개 상세와 같은 렌더로 보여주는 검수 경로다.
         발행되지 않은 문서라 색인되면 안 된다 (app/preview/insight/[slug]/page.tsx). */
      disallow: ['/image-guide', '/admin', '/preview'],
    },
    sitemap: new URL('/sitemap.xml', SITE_URL).toString(),
  }
}
