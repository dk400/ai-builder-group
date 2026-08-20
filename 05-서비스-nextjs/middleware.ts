import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { updateSession, redirectKeepingSession } from '@/lib/supabase/middleware'

/* /admin/* 게이트 — FR-A00-01 · NFR-11

   인수 조건이 "미인증 요청이 **서버에서** 차단됨(클라이언트 판정 금지)"이다.
   화면에서 감추는 것은 차단이 아니다 — 주소를 아는 사람은 그대로 들어온다.

   ── 층을 나눈 이유 ────────────────────────────────────────────────────────
   NFR-11 은 "미들웨어 + 서버 액션 이중"을 요구한다. 둘이 같은 일을 두 번 하는 게 아니라
   **다른 일**을 한다:

     미들웨어    인증(로그인했는가) + 세션 갱신
     서버 액션   권한(이걸 할 수 있는가) — app/admin/_authz.ts
     RLS         마지막 방어선. 앱 코드에 구멍이 나도 DB 가 막는다

   권한 판정을 미들웨어에 두지 않는 것은 의도다. 역할은 DB(`builders.role`)에 있어서
   매 요청마다 조회해야 하고, 미들웨어가 들고 있는 세션은 갱신 타이밍에 따라 낡을 수 있다.
   Supabase 도 "미들웨어에서 인가를 판정하지 말고 RLS 로 막으라"고 안내한다.

   ── 키가 없을 때 ─────────────────────────────────────────────────────────
   Supabase 미설정이면 게이트를 통과시킨다. 어드민이 목업 모드로 남아 있어야 검수를 할 수
   있고, 이 저장소의 규칙("키가 없으면 연동만 꺼진다")과도 맞는다.
   🔴 즉 **키를 넣기 전까지 /admin 은 아무나 들어온다.** 화면 상단 목업 띠가 그 사실을
      알리고 있고, 실데이터가 들어가기 전에 키를 넣는 것이 순서다. */

const LOGIN_PATH = '/admin/login'

export async function middleware(request: NextRequest) {
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
       첫 화면은 A-02 다 — 대시보드는 만들지 않는다 (FR-A00-03 · E10). */
    const to = request.nextUrl.clone()
    to.pathname = '/admin/insight'
    to.search = ''
    return redirectKeepingSession(to, response)
  }

  return response
}

export const config = {
  /* 정적 자산까지 미들웨어를 태우면 매 요청이 느려진다. 어드민 경로만 잡는다.
     공개 페이지는 정적 생성 그대로 나가야 하므로 절대 넓히지 말 것. */
  matcher: ['/admin/:path*'],
}
