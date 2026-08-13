import type { Metadata } from 'next'
import './builder.css'
import BuilderView from './view'

export const metadata: Metadata = {
  title: '빌더 프로필 — AI 빌더 그룹',
  openGraph: { title: '빌더 프로필 — AI 빌더 그룹', url: 'https://ai-builder-group-pearl.vercel.app/builder' },
}

export default function BuilderPage() {
  return <BuilderView />
}
