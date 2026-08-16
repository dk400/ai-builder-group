import type { Metadata } from 'next'
import './admin.css'

/* 어드민 목업 — 인증도 저장도 없다.

   PRD §6 의 7화면(A-01 ~ A-07)을 눈으로 확인하기 위한 껍데기다. Supabase 가 붙기 전이라
   로그인은 통과만 하고, 폼은 아무것도 저장하지 않는다. 화면 안에 그 사실을 띠로 붙여 둔다 —
   목업을 실물로 오해한 채로 클라이언트에게 넘어가는 것이 가장 비싼 사고다.

   ⚠ 지금은 라우트가 열려 있다. 미들웨어 게이트(FR-A00-01)는 4단계에서 붙는다.
   그전까지 이 화면들이 색인되지 않도록 세 겹으로 막는다:
   · 이 layout 의 robots noindex/nofollow
   · robots.txt 의 Disallow: /admin
   · sitemap 미포함
   공개 페이지에서 /admin 으로 가는 링크는 한 곳도 없다 (FR-C-05). */
export const metadata: Metadata = {
  title: '관리자 — AI 빌더 그룹',
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      <p className="adm-mock" role="status">
        <b>목업</b> 화면 확인용입니다 — 로그인·저장·발행이 실제로 동작하지 않습니다
      </p>
      {children}
    </div>
  )
}
