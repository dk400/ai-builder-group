import { pageMeta } from '@/app/_meta'
import './work.css'
import WorkView from './view'

export const metadata = pageMeta({
  title: 'Work — AI 빌더 그룹',
  path: '/work',
})

export default function WorkPage() {
  return <WorkView />
}
