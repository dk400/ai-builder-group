import { notFound } from 'next/navigation'
import { CATEGORY_LABEL, articleBySlug, type InsightCategory } from '@/app/_insights'
import { listInsights, rejectReasonOf } from '../../../_queries'
import InsightEditView from './view'

/* A-03 Insight 편집. id 가 'new' 면 빈 폼이다.
   generateStaticParams 를 두지 않는다 — 셸이 force-dynamic 이라 프리렌더 목록이 의미가 없고,
   어드민 주소를 빌드 산출물에 박아 둘 이유도 없다. */

const CATS: InsightCategory[] = ['ai-ax', 'guide', 'how', 'project']

export default async function AdminInsightEditPage({ params }: { params: Promise<{ id: string }> }) {
  const raw = (await params).id
  const id = decodeURIComponent(raw)

  const cats = CATS.map(c => ({ value: c, label: CATEGORY_LABEL[c] }))

  if (id === 'new') {
    return (
      <InsightEditView
        isNew slug="" title="" excerpt="" cat="guide" author="빌더 조쉬"
        thumb={null} bodyHtml={null} status="draft" updated="—" rejectReason={null} cats={cats}
      />
    )
  }

  const a = articleBySlug(id) ?? articleBySlug(raw)
  if (!a) notFound()
  const rows = await listInsights()
  const row = rows.find(x => x.slug === a.slug)

  return (
    <InsightEditView
      isNew={false}
      slug={a.slug}
      title={a.title}
      excerpt={a.excerpt}
      cat={a.cat}
      author={a.author}
      thumb={`/assets/img/ins/${a.thumb}`}
      bodyHtml={a.bodyHtml ?? null}
      status={row?.status ?? 'draft'}
      updated={row?.updated ?? '—'}
      rejectReason={await rejectReasonOf('insight', a.slug)}
      cats={cats}
    />
  )
}
