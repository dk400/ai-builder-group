import { notFound } from 'next/navigation'
import { BUILDERS } from '@/app/_builders'
import { getWorkForEdit, rejectReasonOf } from '../../../_queries'
import WorkEditView from './view'

/* A-05 Work 편집 화면의 본체. 관리자와 빌더가 같은 화면을 쓴다 —
   이유는 insight/[id]/editor.tsx 주석 참조. 다른 것은 listHref 하나뿐이다. */
export default async function WorkEditorScreen({ raw, listHref }: { raw: string; listHref: string }) {
  const id = decodeURIComponent(raw)

  /* 참여 빌더 연결 UI 는 다중 선택 + 역할 라벨이다 (FR-A05-02) */
  const roster = BUILDERS.map(b => ({ slug: b.slug, name: b.name, avatar: b.avatar, role: b.role }))

  if (id === 'new') {
    return (
      <WorkEditView
        isNew slug="" title="" summary="" tag="" year="" cover={null}
        withPartner={false} builders={[]} status="draft" updated="—" rejectReason={null} roster={roster}
        listHref={listHref}
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
      listHref={listHref}
    />
  )
}
