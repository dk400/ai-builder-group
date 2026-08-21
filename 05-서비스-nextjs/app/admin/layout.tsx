import type { Metadata } from 'next'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import './admin.css'
import { getViewer } from './_authz'
import { RoleProvider, RoleSwitch } from './role'

/* 어드민 목업 — 인증도 저장도 없다.

   PRD §6 의 7화면(A-01 ~ A-07)을 눈으로 확인하기 위한 껍데기다. Supabase 가 붙기 전이라
   로그인은 통과만 하고, 폼은 아무것도 저장하지 않는다. 화면 안에 그 사실을 띠로 붙여 둔다 —
   목업을 실물로 오해한 채로 클라이언트에게 넘어가는 것이 가장 비싼 사고다.

   ⚠ 지금은 라우트가 열려 있다. 미들웨어 게이트(FR-A00-01)는 4단계에서 붙는다.
   그전까지 이 화면들이 색인되지 않도록 세 겹으로 막는다:
   · 이 layout 의 robots noindex/nofollow
   · robots.txt 의 Disallow: /admin
   · sitemap 미포함
   진입점은 푸터 하단 유틸 줄 한 곳뿐이다. GNB 에는 넣지 않는다 (FR-C-05 본문).
   ⚠ 링크가 있다는 것과 접근이 막혀 있다는 것은 다른 문제다 — 색인은 아래 세 겹이 막지만
     아무나 들어오는 것은 미들웨어 게이트가 붙어야 막힌다. */
export const metadata: Metadata = {
  title: '관리자 — AI 빌더 그룹',
  robots: { index: false, follow: false, nocache: true },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (isSupabaseConfigured) {
    /* 인증이 실제로 붙은 상태. 역할·이름은 서버(builders 행)에서만 나오고 역할 스위치는
       사라진다 — 클라이언트 판정 금지(FR-A00-01).

       ⚠ RoleProvider 를 통째로 빼면 안 된다. useRole() 이 컨텍스트 기본값
         (관리자 · '빌더 조쉬')으로 떨어져서, 누가 로그인하든 사이드바가 조쉬 · ADMIN 으로
         나오고 빌더에게도 '승인 대기' 메뉴가 보인다. 데이터는 서버에서 이미 걸러지지만
         화면이 신원을 잘못 말하는 것은 그 자체로 사고다.

       ⚠ 로그인 화면도 이 레이아웃을 쓴다. 그때는 viewer 가 null 이라 최소 권한으로 둔다. */
    const viewer = await getViewer()
    /* initialMe 는 목록의 owner 와 대조하는 키다. 실 데이터에서 owner 는 created_by ·
       author_id 즉 builders.id(UUID)이지 slug 가 아니다 (_queries 의 owner 매핑 참조).
       slug 를 넘기면 빌더 화면에서 rows.filter(r => r.owner === me) 가 전부 걸러져 목록이
       0 건이 된다 — 시드가 정상인데도 그렇게 비었다. builderId 로 UUID 끼리 맞춘다. */
    return (
      <RoleProvider
        initialRole={viewer?.role ?? 'builder'}
        initialMe={viewer?.builderId ?? ''}
        initialName={viewer?.name ?? ''}
        canSwitch={false}
      >
        {/* 목업 띠가 없으므로 그 높이(--adm-bar)를 0 으로 되돌린다 — 안 그러면 사이드바 ·
            상단 헤더 · 로그인 카드가 전부 34px 씩 내려앉은 채로 빈 띠 자리를 남긴다.
            admin.css 를 건드리지 않고 여기서 변수만 덮는다. */}
        <div className="adm" style={{ '--adm-bar': '0px' } as React.CSSProperties}>{children}</div>
      </RoleProvider>
    )
  }

  return (
    <RoleProvider>
      <div className="adm">
        <div className="adm-mock" role="status">
          <span><b>목업</b> 로그인·저장·발행이 실제로 동작하지 않습니다</span>
          {/* 권한 모델(PRD §2.2)을 눈으로 확인하는 스위치. 인증이 붙으면 사라진다 */}
          <RoleSwitch />
        </div>
        {children}
      </div>
    </RoleProvider>
  )
}
