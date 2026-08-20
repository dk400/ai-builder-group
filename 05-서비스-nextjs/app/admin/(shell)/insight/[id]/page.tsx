import { notFound } from 'next/navigation'
import { CATEGORY_LABEL, type InsightCategory } from '@/app/_insights'
import { getInsightForEdit, rejectReasonOf } from '../../../_queries'
import InsightEditView from './view'

/* A-03 Insight 편집. id 가 'new' 면 빈 폼이다.
   generateStaticParams 를 두지 않는다 — 셸이 force-dynamic 이라 프리렌더 목록이 의미가 없고,
   어드민 주소를 빌드 산출물에 박아 둘 이유도 없다. */

const CATS: InsightCategory[] = ['ai-ax', 'guide', 'how', 'project']

export default async function AdminInsightEditPage({ params }: { params: Promise<{ id: string }> }) {
  const raw = (await params).id
  const cats = CATS.map(c => ({ value: c, label: CATEGORY_LABEL[c] }))

  if (raw === 'new') {
    return (
      <InsightEditView
        isNew slug="" title="" excerpt="" cat="guide" author="빌더 조쉬"
        thumb={null} bodyHtml={null} status="draft" updated="—" rejectReason={null} cats={cats}
      />
    )
  }

  /* 어드민 목록과 같은 원천에서 찾는다 — 공개 데이터에는 초안·승인대기·데모 글이 없다 */
  const a = await getInsightForEdit(raw)
  if (!a) notFound()

  return (
    <InsightEditView
      isNew={false}
      slug={a.slug}
      title={a.title}
      excerpt={a.excerpt}
      cat={a.cat}
      author={a.author}
      thumb={a.thumb || null}
      bodyHtml={a.bodyHtml}
      status={a.status}
      updated={a.updated}
      rejectReason={await rejectReasonOf('insight', a.slug)}
      cats={cats}
    />
  )
}
