import type { Metadata } from 'next'
import './content.css'
import ContentView from './view'

export const metadata: Metadata = {
  title: '콘텐츠 — AI 빌더 그룹',
  openGraph: { title: '콘텐츠 — AI 빌더 그룹', url: 'https://ai-builder-group-pearl.vercel.app/content' },
}

export default function ContentPage() {
  return <ContentView />
}
