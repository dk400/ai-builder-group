import { builderBySlug } from '@/app/_builders'
import { adminWorks, countBy, STATUS_ORDER, type Status } from '../../_mock'
import WorkListView from './view'

/* A-04 Work 관리 */
export default function AdminWorkPage() {
  const rows = adminWorks().map(w => ({
    slug: w.slug,
    title: w.title,
    tag: w.tag,
    thumb: `/assets/img/${w.cover}`,
    /* 참여 빌더를 목록에 노출한다 (FR-A04-01) — 누가 만든 건지가 검수의 첫 단서다 */
    builders: w.builders.flatMap(s => { const b = builderBySlug(s); return b ? [b.name] : [] }),
    status: w.status,
    updated: w.updated,
    owner: w.owner,
  }))

  const counts = { all: rows.length } as Record<Status | 'all', number>
  for (const s of STATUS_ORDER) counts[s] = countBy(rows, s)

  return <WorkListView rows={rows} counts={counts} />
}
