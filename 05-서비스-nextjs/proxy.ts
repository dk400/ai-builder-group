import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { updateSession, redirectKeepingSession } from '@/lib/supabase/session'

/* /admin/* 게이트 — FR-A00-01 · NFR-11

   파일 이름이 proxy.ts 인 이유: Next 16 이 middleware 규약을 deprecate 했다.
   같은 기능이고 이름만 바뀌었다 — middleware.ts 로 두면 빌드마다 경고가 뜬다.

   인수 조건이 "미인증 요청이 **서버에서** 차단됨(클라이언트 판정 금지)"이다.
   화면에서 감추는 것은 차단이 아니다 — 주소를 아는 사람은 그대로 들어온다.

   ── 층을 나눈 이유 ────────────────────────────────────────────────────────
   NFR-11 은 "미들웨어 + 서버 액션 이중"을 요구한다. 둘이 같은 일을 두 번 하는 게 아니라
   **다른 일**을 한다:

     proxy       인증(로그인했는가) + 세션 갱신
     서버 액션   권한(이걸 할 수 있는가) — app/admin/_authz.ts
     RLS         마지막 방어선. 앱 코드에 구멍이 나도 DB 가 막는다

   권한 판정을 여기 두지 않는 것은 의도다. 역할은 DB(`builders.role`)에 있어서
   매 요청마다 조회해야 하고, 미들웨어가 들고 있는 세션은 갱신 타이밍에 따라 낡을 수 있다.
   Supabase 도 "이 층에서 인가를 판정하지 말고 RLS 로 막으라"고 안내한다.

   ── 키가 없을 때 ─────────────────────────────────────────────────────────
   Supabase 미설정이면 게이트를 통과시킨다. 어드민이 목업 모드로 남아 있어야 검수를 할 수
   있고, 이 저장소의 규칙("키가 없으면 연동만 꺼진다")과도 맞는다.
   🔴 즉 **키를 넣기 전까지 /admin 은 아무나 들어온다.** 화면 상단 목업 띠가 그 사실을
      알리고 있고, 실데이터가 들어가기 전에 키를 넣는 것이 순서다. */

const LOGIN_PATH = '/admin/login'

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next()

  const { response, user } = await updateSession(request)
  const { pathname, search } = request.nextUrl

  const isLoginPage = pathname === LOGIN_PATH

  if (!user && !isLoginPage) {
    /* 로그인 후 원래 가려던 곳으로 돌려보낸다. 열린 리다이렉트가 되지 않게
       경로만 넘기고, 받는 쪽에서 /admin 으로 시작하는지 다시 검사한다. */
    const to = request.nextUrl.clone()
    to.pathname = LOGIN_PATH
    to.search = ''
    to.searchParams.set('next', pathname + search)
    return redirectKeepingSession(to, response)
  }

  if (user && isLoginPage) {
    /* 이미 로그인한 사람에게 로그인 화면을 보여줄 이유가 없다.
       어디로 갈지는 역할이 정한다(관리자 /admin/insight · 빌더 /admin/builder). 그 판정을
       하는 곳이 /admin 이므로 거기로 넘긴다 — 미들웨어는 역할을 보지 않는다(위 주석). */
    const to = request.nextUrl.clone()
    to.pathname = '/admin'
    to.search = ''
    return redirectKeepingSession(to, response)
  }

  return response
}

export const config = {
  /* 정적 자산까지 태우면 매 요청이 느려진다. 어드민과 검수용 미리보기만 잡는다.
     공개 페이지는 정적 생성 그대로 나가야 하므로 그 밖으로는 절대 넓히지 말 것.

     /preview 를 함께 잡는 이유 — 승인 전 원본(초안 · 승인대기)을 공개 상세와 같은 렌더로
     보여주는 경로다. 주소만 알면 아무나 읽을 수 있으면 그건 "공개 토큰 URL" 이고,
     PRD D3 이 그걸 금지한다(백로그 §A-07 — 미리보기는 인증 필수).
     robots 차단과 noindex 는 색인을 막을 뿐 접근을 막지 못한다.

     공개 `/builder`(빌더 소개)는 잡지 않는다. 빌더 작업 공간은 `/admin/builder` 아래에 있고,
     공개 소개 페이지는 사이트맵 · GNB · Work 상세가 가리키는 그대로 남는다. */
  matcher: ['/admin/:path*', '/preview/:path*'],
}
