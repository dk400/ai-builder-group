import type { Metadata } from 'next'
import './insight.css'
import InsightView from './view'

export const metadata: Metadata = {
  title: 'Insight — AI 빌더 그룹',
  openGraph: { title: 'Insight — AI 빌더 그룹', url: 'https://ai-builder-group-pearl.vercel.app/insight' },
}

export default function InsightPage() {
  return <InsightView />
}
