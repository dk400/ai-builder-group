import { notFound } from 'next/navigation'
import { CATEGORY_LABEL, type InsightCategory } from '@/app/_insights'
import { getInsightForEdit, rejectReasonOf } from '../../../_queries'
import InsightEditView from './view'

/* A-03 Insight 편집 화면의 본체.

   관리자(/admin/insight/[id])와 빌더(/admin/builder/insight/[id])가 같은 화면을 쓴다.
   두 라우트가 각자 데이터를 조립하면 반드시 한쪽만 고쳐지는 날이 오므로 여기 한 벌만 둔다.
   다른 것은 '목록으로' 가 어디를 가리키느냐뿐이다 — listHref.

   권한은 여기서 보지 않는다. 영역 판정은 각 page.tsx 의 가드(_area)가, 실제 편집 권한은
   서버 액션(_authz)과 RLS 가 본다. */

const CATS: InsightCategory[] = ['ai-ax', 'guide', 'how', 'project']

export default async function InsightEditorScreen({ raw, listHref }: { raw: string; listHref: string }) {
  const cats = CATS.map(c => ({ value: c, label: CATEGORY_LABEL[c] }))

  if (raw === 'new') {
    return (
      <InsightEditView
        isNew slug="" title="" excerpt="" cat="guide" author="빌더 조쉬"
        thumb={null} bodyHtml={null} status="draft" updated="—" rejectReason={null} cats={cats}
        listHref={listHref}
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
      listHref={listHref}
    />
  )
}
