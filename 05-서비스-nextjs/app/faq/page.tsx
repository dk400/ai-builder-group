import { pageMeta } from '@/app/_meta'
import './faq.css'
import FaqView from './view'

export const metadata = pageMeta({
  title: 'FAQ — AI 빌더 그룹',
  path: '/faq',
  description: '외주 문의와 진행 방식에 대해 가장 많이 받는 질문을 모았습니다. 기간·검수·수정 범위·유지보수까지 미리 확인하세요.',
})

export default function FaqPage() {
  return <FaqView />
}
