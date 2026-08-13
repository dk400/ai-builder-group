import type { Metadata } from 'next'
import './work-detail.css'
import WorkDetailView from './view'

export const metadata: Metadata = {
  title: 'AI 상담 챗봇 구축 — Work',
  openGraph: { title: 'AI 상담 챗봇 구축 — Work', url: 'https://ai-builder-group-pearl.vercel.app/work-detail' },
}

export default function WorkDetailPage() {
  return <WorkDetailView />
}
