/* 구조화 데이터 — SR-04 (Organization / Article / BreadcrumbList)

   메타 태그는 "이 페이지가 무엇인지"를 사람이 읽는 문장으로 알려주고, JSON-LD 는 같은 것을
   기계가 파싱할 수 있는 형태로 알려준다. 검색 결과의 사이트 이름·빵부스러기 경로가 여기서 나온다.

   URL 은 전부 절대 주소로 낸다 — 상대 경로는 metadataBase 를 타는 메타 태그와 달리
   JSON-LD 에서는 아무도 보정해 주지 않는다.

   ⚠ 값은 반드시 화면에 실제로 있는 것만 넣는다. 구조화 데이터에만 있고 본문에 없는 정보는
     구글 가이드라인 위반이고, 날짜 같은 값을 지어내면 그대로 거짓말이 된다. */

import { SITE, SITE_URL, DEFAULT_DESC } from './_meta'

const abs = (path: string) => new URL(path, SITE_URL).toString()

/** 전 페이지 공통. 검색 결과의 사이트 이름·로고가 이 블록에서 나온다 */
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': abs('/#organization'),
    name: SITE,
    url: abs('/'),
    /* GNB 로고 마크와 같은 파일. 구글은 SVG 로고를 받는다 */
    logo: abs('/icon.svg'),
    description: DEFAULT_DESC,
    /* sameAs 는 넣지 않는다. 콘텐츠 페이지의 유튜브 채널 셋은 파트너 채널이라
       "이 조직의 공식 프로필"이 아니다. 자사 채널·SNS 가 생기면 그때 넣는다. */
  }
}

/** 목록 → 상세 경로. 검색 결과에 도메인 대신 경로가 표시된다 */
export function breadcrumbLd(trail: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  }
}

/** Insight 상세. 실제 글이라 Article 이 맞고 날짜·작성자가 데이터에 있다 */
export function articleLd(a: {
  slug: string
  title: string
  excerpt: string
  thumb: string
  author: string
  /** 'YYYY.MM.DD' — 데이터 표기 그대로 받는다 */
  date: string
}) {
  const url = abs(`/insight/${a.slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: a.title,
    description: a.excerpt,
    image: abs(`/assets/img/ins/${a.thumb}`),
    /* 'YYYY.MM.DD' → 'YYYY-MM-DD'. 형식이 다르면 구글이 통째로 무시한다 */
    datePublished: a.date.replace(/\./g, '-'),
    author: { '@type': 'Person', name: a.author },
    publisher: { '@id': abs('/#organization') },
  }
}

/** Work 상세.

    Article 로 내지 않는다 — Article 은 발행일이 핵심 속성인데 Work 데이터에는 연도밖에 없고,
    `2026-01-01` 같은 값을 만들어 채우면 검색엔진에 거짓 날짜를 주는 것이 된다.
    포트폴리오 항목의 정확한 타입은 CreativeWork 다. */
export function workLd(w: {
  slug: string
  title: string
  summary: string
  cover: string
  tag: string
  year: string
  builders: Array<{ name: string }>
}) {
  const url = abs(`/work/${w.slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': url,
    name: w.title,
    description: w.summary,
    image: abs(`/assets/img/${w.cover}`),
    genre: w.tag,
    dateCreated: w.year,
    creator: { '@id': abs('/#organization') },
    ...(w.builders.length > 0
      ? { contributor: w.builders.map(b => ({ '@type': 'Person', name: b.name })) }
      : {}),
  }
}
