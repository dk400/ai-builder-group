import { pageMeta } from '@/app/_meta'
import './contact.css'
import ContactView from './view'

export const metadata = pageMeta({
  title: '프로젝트 문의 — AI 빌더 그룹',
  path: '/contact',
})

export default function ContactPage() {
  return <ContactView />
}
