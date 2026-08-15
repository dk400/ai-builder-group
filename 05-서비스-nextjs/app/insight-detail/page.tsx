import { pageMeta } from '@/app/_meta'
import './insight-detail.css'
import InsightDetailView from './view'

export const metadata = pageMeta({
  title: '바이브 코딩 외주, 잘하는 곳과 못하는 곳의 차이 — Insight',
  path: '/insight-detail',
})

export default function InsightDetailPage() {
  return <InsightDetailView />
}
