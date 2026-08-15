import { pageMeta } from '@/app/_meta'
import './submit.css'
import SubmitView from './view'

export const metadata = pageMeta({
  title: '문의 접수 완료 — AI 빌더 그룹',
  path: '/submit',
})

export default function SubmitPage() {
  return <SubmitView />
}
