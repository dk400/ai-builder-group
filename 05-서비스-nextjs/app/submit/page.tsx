import type { Metadata } from 'next'
import './submit.css'
import SubmitView from './view'

export const metadata: Metadata = {
  title: '문의 접수 완료 — AI 빌더 그룹',
  openGraph: { title: '문의 접수 완료 — AI 빌더 그룹', url: 'https://ai-builder-group-pearl.vercel.app/submit' },
}

export default function SubmitPage() {
  return <SubmitView />
}
