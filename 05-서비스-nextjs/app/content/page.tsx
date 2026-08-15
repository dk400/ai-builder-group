import { pageMeta } from '@/app/_meta'
import './content.css'
import ContentView from './view'

export const metadata = pageMeta({
  title: '콘텐츠 — AI 빌더 그룹',
  path: '/content',
})

export default function ContentPage() {
  return <ContentView />
}
