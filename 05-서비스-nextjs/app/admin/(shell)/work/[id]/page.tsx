import { notFound } from 'next/navigation'
import { WORKS, workBySlug } from '@/app/_works'
import { BUILDERS } from '@/app/_builders'
import { adminWorks, REJECT_REASON } from '../../../_mock'
import WorkEditView from './view'

/* A-05 Work 편집. id 가 'new' 면 빈 폼이다 */
export function generateStaticParams() {
  return [{ id: 'new' }, ...WORKS.map(w => ({ id: w.slug }))]
}

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

  const w = workBySlug(id) ?? workBySlug(raw)
  if (!w) notFound()
  const row = adminWorks().find(x => x.slug === w.slug)!

  return (
    <WorkEditView
      isNew={false}
      slug={w.slug}
      title={w.title}
      summary={w.summary}
      tag={w.tag}
      year={w.year}
      cover={`/assets/img/${w.cover}`}
      withPartner={w.withPartner}
      builders={w.builders}
      status={row.status}
      updated={row.updated}
      rejectReason={REJECT_REASON[w.slug] ?? null}
      roster={roster}
    />
  )
}
