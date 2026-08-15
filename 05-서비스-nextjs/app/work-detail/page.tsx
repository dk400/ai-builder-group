import { pageMeta } from '@/app/_meta'
import './work-detail.css'
import WorkDetailView from './view'

export const metadata = pageMeta({
  title: 'AI 상담 챗봇 구축 — Work',
  path: '/work-detail',
})

export default function WorkDetailPage() {
  return <WorkDetailView />
}
