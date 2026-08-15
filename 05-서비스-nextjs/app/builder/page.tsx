import { pageMeta } from '@/app/_meta'
import './builder.css'
import BuilderView from './view'

export const metadata = pageMeta({
  title: '빌더 프로필 — AI 빌더 그룹',
  path: '/builder',
})

export default function BuilderPage() {
  return <BuilderView />
}
