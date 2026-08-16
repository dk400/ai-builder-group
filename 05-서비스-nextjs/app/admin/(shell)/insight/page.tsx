import { CATEGORY_LABEL } from '@/app/_insights'
import { adminInsights, countBy, STATUS_ORDER, type Status } from '../../_mock'
import InsightListView from './view'

/* A-02 Insight 관리 */
export default function AdminInsightPage() {
  const rows = adminInsights().map(a => ({
    slug: a.slug,
    title: a.title,
    catLabel: CATEGORY_LABEL[a.cat],
    author: a.author,
    thumb: `/assets/img/ins/${a.thumb}`,
    status: a.status,
    updated: a.updated,
  }))

  const counts = { all: rows.length } as Record<Status | 'all', number>
  for (const s of STATUS_ORDER) counts[s] = countBy(rows, s)

  return <InsightListView rows={rows} counts={counts} />
}
