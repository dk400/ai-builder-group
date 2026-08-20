import type { Metadata } from 'next'
import { pageMeta } from '@/app/_meta'
import './submit.css'
import SubmitView from './view'

/* NFR-16 — /submit 은 noindex. 검색으로 들어올 주소가 아니고, 색인되면 문의한 적 없는
   방문자가 완료 화면에 떨어져 ★ contact_submit 전환 지표가 오염된다.
   (sitemap 에서도 빠져 있다) */
export const metadata: Metadata = {
  ...pageMeta({
    title: '문의 접수 완료 — AI 빌더 그룹',
    path: '/submit',
  }),
  robots: { index: false, follow: true },
}

export default function SubmitPage() {
  return <SubmitView />
}
