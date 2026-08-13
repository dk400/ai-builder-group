import type { Metadata } from 'next'
import './work.css'
import WorkView from './view'

export const metadata: Metadata = {
  title: 'Work — AI 빌더 그룹',
  openGraph: { title: 'Work — AI 빌더 그룹', url: 'https://ai-builder-group-pearl.vercel.app/work' },
}

export default function WorkPage() {
  return <WorkView />
}
