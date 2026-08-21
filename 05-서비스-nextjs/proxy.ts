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

/* 빌더 작업 공간 진입점.

   `/builder` 는 원래 공개 빌더 소개 페이지(P-03)다 — 사이트맵 · llms.txt · GNB · Work 목록 ·
   Work 상세의 빌더 칩이 전부 이 주소를 가리킨다. 그래서 통째로 어드민으로 바꾸지 않는다.
   대신 **로그인한 사람에게만** 작업 공간 입구가 되게 한다:

     크롤러 · 비로그인    지금까지와 똑같은 공개 페이지 (정적 생성 · 색인 유지)
     로그인한 사람        작업 공간으로 이동
     ?b= 가 붙은 주소     그대로 공개 프로필 (어드민의 '공개 화면 보기' 링크가 이 모양이다)

   ⚠ 역할(빌더냐 관리자냐)은 여기서 보지 않는다. 이 파일 위쪽 주석에 적은 이유 그대로 —
     역할은 DB 에 있어서 매 요청 조회해야 하고, 미들웨어 세션은 낡을 수 있다.
     그래서 로그인한 사람은 역할과 무관하게 작업 공간으로 보내고, 무엇을 볼지는 거기서 정한다. */
const BUILDER_ENTRY = '/builder'
const WORKSPACE = '/admin/insight'

/* 세션 쿠키가 있을 때만 Supabase 에 물어본다.

   `/builder` 는 공개 페이지라 대부분의 요청이 비로그인이다. 그 요청까지 updateSession() 을
   태우면 방문자마다 인증 서버 왕복이 하나 붙는다 — 공개 페이지에서 그건 그대로 체감 지연이다.
   쿠키 이름은 @supabase/ssr 규약(`sb-<프로젝트ref>-auth-token`)을 따른다. */
function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.includes('auth-token'))
}

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.next()

  if (request.nextUrl.pathname === BUILDER_ENTRY) {
    if (request.nextUrl.searchParams.has('b')) return NextResponse.next()
    if (!hasSessionCookie(request)) return NextResponse.next()

    const { response, user } = await updateSession(request)
    /* 쿠키는 있는데 세션이 죽은 경우다. 공개 페이지를 그대로 보여준다 —
       공개 주소에서 로그인 화면으로 튕기면 그게 더 이상하다 */
    if (!user) return response

    const to = request.nextUrl.clone()
    to.pathname = WORKSPACE
    to.search = ''
    return redirectKeepingSession(to, response)
  }

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
  /* 정적 자산까지 태우면 매 요청이 느려진다. 어드민과 검수용 미리보기만 잡는다.
     공개 페이지는 정적 생성 그대로 나가야 하므로 그 밖으로는 절대 넓히지 말 것.

     /preview 를 함께 잡는 이유 — 승인 전 원본(초안 · 승인대기)을 공개 상세와 같은 렌더로
     보여주는 경로다. 주소만 알면 아무나 읽을 수 있으면 그건 "공개 토큰 URL" 이고,
     PRD D3 이 그걸 금지한다(백로그 §A-07 — 미리보기는 인증 필수).
     robots 차단과 noindex 는 색인을 막을 뿐 접근을 막지 못한다.

     '/builder' 는 **정확히 그 경로 하나만** 잡는다(:path* 를 붙이지 않는다). 하위의
     /builder/login · /builder/signup 까지 태우면 로그인하러 온 사람을 로그인 전에
     가로채게 된다. 이 항목의 목적은 진입점 하나를 갈라 주는 것뿐이다. */
  matcher: ['/admin/:path*', '/preview/:path*', '/builder'],
}
