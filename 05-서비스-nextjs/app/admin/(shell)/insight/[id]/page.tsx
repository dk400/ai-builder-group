import { notFound } from 'next/navigation'
import { ARTICLES, CATEGORY_LABEL, articleBySlug, type InsightCategory } from '@/app/_insights'
import { adminInsights, REJECT_REASON } from '../../../_mock'
import InsightEditView from './view'

/* A-03 Insight 편집. id 가 'new' 면 빈 폼이다 */
export function generateStaticParams() {
  return [{ id: 'new' }, ...ARTICLES.map(a => ({ id: a.slug }))]
}

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
  const row = adminInsights().find(x => x.slug === a.slug)!

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
      status={row.status}
      updated={row.updated}
      rejectReason={REJECT_REASON[a.slug] ?? null}
      cats={cats}
    />
  )
}
