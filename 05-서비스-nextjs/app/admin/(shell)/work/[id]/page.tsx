import { notFound } from 'next/navigation'
import { BUILDERS } from '@/app/_builders'
import { getWorkForEdit, rejectReasonOf } from '../../../_queries'
import WorkEditView from './view'

/* A-05 Work 편집. id 가 'new' 면 빈 폼이다.
   generateStaticParams 를 두지 않는다 — 셸이 force-dynamic 이라 프리렌더 목록이 의미가 없고,
   어드민 주소를 빌드 산출물에 박아 둘 이유도 없다. */

export default async function AdminWorkEditPage({ params }: { params: Promise<{ id: string }> }) {
  const raw = (await params).id
  const id = decodeURIComponent(raw)

  /* 참여 빌더 연결 UI 는 다중 선택 + 역할 라벨이다 (FR-A05-02) */
  const roster = BUILDERS.map(b => ({ slug: b.slug, name: b.name, avatar: b.avatar, role: b.role }))

  if (id === 'new') {
    return (
      <WorkEditView
        isNew slug="" title="" summary="" tag="" year="" cover={null}
        withPartner={false} builders={[]} status="draft" updated="—" rejectReason={null} roster={roster}
      />
    )
  }

  /* 어드민 목록과 같은 원천에서 찾는다 — 공개 데이터에는 초안 · 승인대기 · 데모 건이 없다 */
  const w = await getWorkForEdit(raw)
  if (!w) notFound()

  return (
    <WorkEditView
      isNew={false}
      slug={w.slug}
      title={w.title}
      summary={w.summary}
      tag={w.tag}
      year={w.year}
      cover={w.cover || null}
      withPartner={w.withPartner}
      builders={w.builders}
      status={w.status}
      updated={w.updated}
      rejectReason={await rejectReasonOf('work', w.slug)}
      roster={roster}
    />
  )
}
