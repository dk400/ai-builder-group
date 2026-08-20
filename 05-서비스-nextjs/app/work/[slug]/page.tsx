import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { pageMeta } from '@/app/_meta'
import { WORKS, workBySlug } from '@/app/_works'
import { builderBySlug } from '@/app/_builders'
import { workLd, breadcrumbLd } from '@/app/_jsonld'
import JsonLd from '@/components/JsonLd'
import './detail.css'
import WorkDetailView from './view'

/* 목록에 없는 슬러그는 404 로 떨어뜨린다 — FR-C-09 는 200 을 명시적으로 금지한다.

   ⚠ dynamicParams=false 로 막으면 안 된다. 슬러그가 한글이라 요청 경로가 퍼센트 인코딩된
   채로 들어오는데, 그 상태로 프리렌더 목록에 없으면 Next 가 404 대신 NoFallbackError 를
   던져 500 이 나간다 (`/work/foo` 는 404, `/work/없는프로젝트` 는 500 이었다).
   렌더까지 오게 두고 notFound() 로 직접 떨어뜨리면 두 경우 다 404 다. */
export function generateStaticParams() {
  return WORKS.map(w => ({ slug: w.slug }))
}

/* 슬러그가 한글이라 주소창에서는 퍼센트 인코딩된 채로 돌아다닌다.
   Next 가 디코드해 주지만, 이중 인코딩된 요청이 들어와도 살아남게 한 번 더 벗긴다. */
function resolve(raw: string) {
  return workBySlug(raw) ?? workBySlug(decodeURIComponent(raw))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const work = resolve((await params).slug)
  if (!work) return {}
  return pageMeta({
    title: `${work.title} — Work`,
    path: `/work/${work.slug}`,
    description: work.summary,
  })
}

export default async function WorkDetailPage({ params }: Props) {
  const work = resolve((await params).slug)
  if (!work) notFound()

  /* 빌더는 슬러그만 들고 있다. 이름·사진은 여기서 붙여 클라이언트로 넘긴다 —
     뷰가 빌더 배열 전체를 들고 다닐 이유가 없다. */
  const builders = work.builders.flatMap((slug, i) => {
    const b = builderBySlug(slug)
    return b ? [{ slug: b.slug, name: b.name, avatar: b.avatar, roleLabel: i === 0 ? '리드' : '참여' }] : []
  })

  return (
    <>
      {/* SR-04 — 상세는 구조화 데이터를 두 벌 낸다. 목록→상세 경로(BreadcrumbList)가 있어야
          검색 결과에 도메인 대신 `AI 빌더 그룹 > Work > …` 로 표시된다. */}
      <JsonLd
        data={workLd({
          slug: work.slug,
          title: work.title,
          summary: work.summary,
          cover: work.cover,
          tag: work.tag,
          year: work.year,
          builders,
        })}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: '홈', path: '/' },
          { name: 'Work', path: '/work' },
          { name: work.title, path: `/work/${work.slug}` },
        ])}
      />
      <WorkDetailView
        slug={work.slug}
        cat={work.cat}
        title={work.title}
        summary={work.summary}
        tag={work.tag}
        year={work.year}
        cover={work.cover}
        coverAlt={work.coverAlt}
        withPartner={work.withPartner}
        builders={builders}
      />
    </>
  )
}
