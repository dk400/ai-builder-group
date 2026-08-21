import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ARTICLES, CATEGORY_LABEL, tocOf } from '@/app/_insights'
import { getInsightPreview } from '@/app/admin/_queries'
import InsightDetailView from '@/app/insight/[slug]/view'
import '@/app/insight/[slug]/detail.css'
import PreviewBar from '../../bar'
import '../../preview.css'

/* A-07 승인 대기 → '미리보기' 가 여는 화면 (FR-A07-02 — 공개 화면과 같은 렌더).

   왜 /insight/[slug] 를 열지 않는가 — 그 라우트의 원천은 ARTICLES 이고, 승인 전 글은 거기
   없다. 그대로 열면 404 다. 있는 것처럼 만들려고 ARTICLES 에 넣으면 초안이 목록 · 사이트맵 ·
   llms.txt 까지 따라 올라간다. 그래서 라우트를 따로 두고 승인 전 원본만 여기로 읽는다.

   🔴 이 경로는 인증 뒤에 있어야 한다 (백로그 §A-07 — PRD D3, 공개 토큰 URL 금지).
     지금은 어드민 전체가 그렇듯 열려 있고 noindex + robots 차단으로만 가려져 있다.
     4단계 미들웨어 게이트(FR-A00-01)에 /admin 과 함께 /preview 를 넣을 것.

   구조화 데이터(JsonLd)는 일부러 넣지 않는다 — 아직 공개되지 않은 문서다. */

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getInsightPreview((await params).slug)
  return {
    title: a ? `미리보기 — ${a.title}` : '미리보기',
    /* pageMeta() 를 쓰지 않는다. canonical · OG 는 공개된 주소에만 붙어야 한다 */
    robots: { index: false, follow: false, nocache: true },
  }
}

export default async function InsightPreviewPage({ params }: Props) {
  const a = await getInsightPreview((await params).slug)
  if (!a) notFound()

  /* '함께 읽기' 는 공개 상세와 같은 규칙 — 같은 카테고리를 먼저 채우고 최신 글로 메운다.
     추천 대상은 공개된 글(ARTICLES)뿐이다. 검수 중인 글을 서로 추천하게 두지 않는다. */
  const others = ARTICLES.filter(x => x.slug !== a.slug)
  const related = [...others.filter(x => x.cat === a.cat), ...others.filter(x => x.cat !== a.cat)]
    .slice(0, 2)
    .map(x => ({ slug: x.slug, title: x.title, catLabel: CATEGORY_LABEL[x.cat] }))

  return (
    <>
      <InsightDetailView
        slug={a.slug}
        cat={a.cat}
        catLabel={a.catLabel}
        title={a.title}
        thumb=""
        thumbSrc={a.thumbSrc}
        author={a.author}
        authorType={a.authorType}
        date={a.date}
        readMin={a.readMin}
        bodyHtml={a.bodyHtml}
        toc={a.bodyHtml ? tocOf(a.bodyHtml) : []}
        related={related}
      />
      <PreviewBar status={a.status} backHref="/admin/approvals" />
    </>
  )
}
