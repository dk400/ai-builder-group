import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { pageMeta } from '@/app/_meta'
import { ARTICLES, CATEGORY_LABEL, articleBySlug, tocOf } from '@/app/_insights'
import './detail.css'
import InsightDetailView from './view'

/* 목록에 없는 슬러그는 404 (FR-C-09).
   dynamicParams=false 를 쓰지 않는 이유는 work/[slug]/page.tsx 주석 참조 — 한글 슬러그에서
   404 대신 500 이 나간다. */
export function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }))
}

function resolve(raw: string) {
  return articleBySlug(raw) ?? articleBySlug(decodeURIComponent(raw))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = resolve((await params).slug)
  if (!a) return {}
  return pageMeta({
    title: `${a.title} — Insight`,
    path: `/insight/${a.slug}`,
    description: a.excerpt,
  })
}

export default async function InsightDetailPage({ params }: Props) {
  const a = resolve((await params).slug)
  if (!a) notFound()

  /* 함께 읽기 — 같은 카테고리를 먼저 채우고, 모자라면 최신 글로 메운다.
     자기 자신은 어느 쪽에서도 빠진다. */
  const others = ARTICLES.filter(x => x.slug !== a.slug)
  const related = [...others.filter(x => x.cat === a.cat), ...others.filter(x => x.cat !== a.cat)]
    .slice(0, 2)
    .map(x => ({ slug: x.slug, title: x.title, catLabel: CATEGORY_LABEL[x.cat] }))

  return (
    <InsightDetailView
      slug={a.slug}
      cat={a.cat}
      catLabel={CATEGORY_LABEL[a.cat]}
      title={a.title}
      thumb={a.thumb}
      author={a.author}
      authorType={a.source === 'own' ? 'team' : 'partner'}
      date={a.date}
      readMin={a.readMin ?? null}
      bodyHtml={a.bodyHtml ?? null}
      toc={a.bodyHtml ? tocOf(a.bodyHtml) : []}
      related={related}
    />
  )
}
