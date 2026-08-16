import type { MetadataRoute } from 'next'
import { SITE_URL } from './_meta'
import { WORKS } from './_works'
import { ARTICLES } from './_insights'

/* 사이트맵이 없으면 색인은 링크를 타고 들어오는 만큼만 된다.

   고정 라우트는 손으로 적는다 — 파일 시스템을 훑으면 목업용 라우트까지 딸려 들어간다.
   반면 Work·Insight 상세는 콘텐츠 수만큼 늘어나므로 데이터에서 뽑는다. 어드민이 붙으면
   글을 쓸 때마다 이 파일을 고쳐야 하는 구조는 반드시 한 번 빠진다.

   제외:
   · /image-guide — 내부 제작 문서. 페이지 자체도 noindex 다.
   · /submit      — 문의 접수 완료 화면. 검색으로 들어올 수 있는 주소가 아니다.
   · /admin/*     — 아직 없지만, 생기면 여기 들어오지 않는다 (FR-A00-02).

   priority 는 구글이 무시한 지 오래지만 다른 크롤러가 참고하므로 남겨 둔다. */
type Freq = MetadataRoute.Sitemap[number]['changeFrequency']

const STATIC: Array<{ path: string; priority: number; freq: Freq }> = [
  { path: '/', priority: 1.0, freq: 'weekly' },
  { path: '/work', priority: 0.9, freq: 'weekly' },
  { path: '/builder', priority: 0.7, freq: 'monthly' },
  { path: '/insight', priority: 0.8, freq: 'weekly' },
  { path: '/content', priority: 0.8, freq: 'weekly' },
  { path: '/faq', priority: 0.7, freq: 'monthly' },
  { path: '/contact', priority: 0.9, freq: 'monthly' },
  { path: '/privacy', priority: 0.3, freq: 'yearly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  /* 슬러그가 한글이라 URL 에는 퍼센트 인코딩된 형태로 들어가야 한다. new URL 이 알아서 한다. */
  const details: Array<{ path: string; priority: number; freq: Freq }> = [
    ...WORKS.map(w => ({ path: `/work/${w.slug}`, priority: 0.7, freq: 'monthly' as Freq })),
    ...ARTICLES.map(a => ({ path: `/insight/${a.slug}`, priority: 0.6, freq: 'monthly' as Freq })),
  ]

  /* lastModified 를 빌드 시각으로 두면 내용이 그대로여도 배포마다 바뀐다.
     크롤러가 "또 안 바뀌었네"를 반복해서 배우면 신호가 무뎌지므로 아예 넣지 않는다. */
  return [...STATIC, ...details].map(r => ({
    url: new URL(r.path, SITE_URL).toString(),
    changeFrequency: r.freq,
    priority: r.priority,
  }))
}
