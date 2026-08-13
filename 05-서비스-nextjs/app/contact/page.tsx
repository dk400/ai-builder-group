import type { Metadata } from 'next'
import './contact.css'
import ContactView from './view'

export const metadata: Metadata = {
  title: '프로젝트 문의 — AI 빌더 그룹',
  openGraph: { title: '프로젝트 문의 — AI 빌더 그룹', url: 'https://ai-builder-group-pearl.vercel.app/contact' },
}

export default function ContactPage() {
  return <ContactView />
}
