import type { Metadata } from 'next'

/* 라우트 metadata 를 한 곳에서 만든다.

   Next 는 자식이 openGraph 를 선언하면 부모 것을 병합하지 않고 통째로 갈아끼운다.
   그래서 페이지마다 openGraph 를 손으로 적으면 루트에 붙은 og:image 가 사라진다 —
   실제로 서브 페이지 9개가 전부 og:image 없이 나가고 있었고, 메신저는 대신
   본문 첫 이미지(프로젝트 로고)를 주워서 미리보기를 만들었다.

   그래서 여기서 openGraph 를 통째로 조립하고, 각 페이지는 제목·경로만 넘긴다. */

export const SITE = 'AI 빌더 그룹'
export const DEFAULT_DESC =
  'AI 시대에 최적화된 개발자가 바이브 코딩으로 외주를 해드립니다. 기획부터 개발, 검수까지 검증된 빌더가 끝까지 맡습니다.'

/* app/opengraph-image.tsx 가 만드는 카드. 파일 기반 라우트라 경로가 고정이다.
   상대 경로로 두면 layout 의 metadataBase 를 타므로 도메인이 바뀌어도 따라온다. */
const OG_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: SITE }

export function pageMeta(opts: { title: string; path: string; description?: string }): Metadata {
  const description = opts.description ?? DEFAULT_DESC
  return {
    title: opts.title,
    description,
    alternates: { canonical: opts.path },
    openGraph: {
      type: 'website',
      siteName: SITE,
      locale: 'ko_KR',
      title: opts.title,
      description,
      url: opts.path,
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image' },
  }
}
