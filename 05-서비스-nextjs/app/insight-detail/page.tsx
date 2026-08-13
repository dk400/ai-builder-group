import type { Metadata } from 'next'
import './insight-detail.css'
import InsightDetailView from './view'

export const metadata: Metadata = {
  title: '바이브 코딩 외주, 잘하는 곳과 못하는 곳의 차이 — Insight',
  openGraph: {
    title: '바이브 코딩 외주, 잘하는 곳과 못하는 곳의 차이 — Insight',
    url: 'https://ai-builder-group-pearl.vercel.app/insight-detail',
  },
}

export default function InsightDetailPage() {
  return <InsightDetailView />
}
