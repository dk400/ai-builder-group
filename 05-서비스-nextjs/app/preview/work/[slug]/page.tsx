import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getWorkPreview } from '@/app/admin/_queries'
import WorkDetailView from '@/app/work/[slug]/view'
import '@/app/work/[slug]/detail.css'
import PreviewBar from '../../bar'
import '../../preview.css'

/* A-07 승인 대기 → '미리보기' 가 여는 화면 (Work).
   이유·제약은 ../../insight/[slug]/page.tsx 주석과 같다 — 승인 전 프로젝트는 WORKS 에
   없어서 /work/[slug] 로 열면 404 이고, WORKS 에 넣으면 초안이 공개된다. */

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const w = await getWorkPreview((await params).slug)
  return {
    title: w ? `미리보기 — ${w.title}` : '미리보기',
    robots: { index: false, follow: false, nocache: true },
  }
}

export default async function WorkPreviewPage({ params }: Props) {
  const w = await getWorkPreview((await params).slug)
  if (!w) notFound()

  return (
    <>
      <WorkDetailView
        slug={w.slug}
        cat={w.cat}
        title={w.title}
        summary={w.summary}
        tag={w.tag}
        year={w.year}
        cover=""
        coverSrc={w.coverSrc}
        coverAlt={w.coverAlt}
        withPartner={w.withPartner}
        builders={w.builders}
        bodyProblem={w.bodyProblem}
        bodySolution={w.bodySolution}
        bodyResult={w.bodyResult}
      />
      <PreviewBar status={w.status} backHref="/admin/approvals" />
    </>
  )
}
