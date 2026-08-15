import { pageMeta } from '@/app/_meta'
import './insight.css'
import InsightView from './view'

export const metadata = pageMeta({
  title: 'Insight — AI 빌더 그룹',
  path: '/insight',
})

export default function InsightPage() {
  return <InsightView />
}
