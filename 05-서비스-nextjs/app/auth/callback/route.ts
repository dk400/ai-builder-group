import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { safeLoginPath, safeNext } from '@/app/admin/login/_next'

/* OAuth·이메일 인증 콜백 (FR-A01-01 · FR-A01-02 · FR-A01-05)

   구글 → Supabase → 여기. 받은 code 를 세션으로 교환하고 어드민으로 들여보낸다.

   /admin 이 아니라 /auth 아래에 두는 이유 — proxy.ts 의 matcher 가 '/admin/:path*' 라서
   /admin/auth/callback 으로 두면 **세션이 생기기 전에** 인증 게이트를 먼저 지나게 되고,
   미인증으로 판정돼 로그인 화면으로 되돌려진다. 교환이 끝나기 전까지는 게이트 밖이어야 한다.

   ⚠ 라우트 핸들러에서는 cookies() 쓰기가 실제 응답에 실린다(서버 컴포넌트와 다른 점).
     세션 쿠키가 여기서 심기므로 createSupabaseServerClient 를 그대로 쓴다. */

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const next = safeNext(searchParams.get('next'))
  const loginPath = safeLoginPath(searchParams.get('loginPath'))
  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}${loginPath}?error=${reason}&next=${encodeURIComponent(next)}`)

  /* 키가 없는 목업 상태에서는 이 주소로 올 일이 없다. 눌러서 들어왔다면 로그인으로 돌린다 */
  if (!isSupabaseConfigured) return NextResponse.redirect(`${origin}${loginPath}`)

  /* 사용자가 구글 동의 화면에서 취소하면 code 대신 error 가 온다 */
  if (searchParams.get('error')) return fail('oauth')

  const code = searchParams.get('code')
  if (!code) return fail('oauth')

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return fail('oauth')

  /* 여기서부터가 이 라우트의 핵심이다.

     구글 로그인은 **누구나** 시도할 수 있다. 교환이 성공했다는 것은 "구글 계정이 진짜다"일
     뿐이고, 우리 서비스의 빌더 신청 계정이 있다는 뜻은 아니다. 이메일 회원가입 또는 관리자
     발급으로 만들어진 builders 행이 없는 구글 계정은 어드민에 들여보내지 않는다.

     그래서 builders 에 행이 있는지 확인하고, 없으면 세션을 즉시 없앤다.
     (RLS 와 getViewer() 가 뒤에서 한 번 더 막지만, 로그인된 채로 빈 화면을 보여 주는 것과
      "계정이 없습니다"라고 말해 주는 것은 다르다.) */
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return fail('oauth')

  const { data: builder } = await supabase
    .from('builders')
    .select('id, is_active, role')
    .eq('auth_user_id', auth.user.id)
    .maybeSingle()

  if (!builder) {
    await supabase.auth.signOut()
    return fail('no-account')
  }

  /* 회수된 계정은 구글로도 들어올 수 없다 (FR-A01-05 · FR-A06-03) */
  const approval = auth.user.app_metadata.builder_approval
  const isApplicant = approval === 'draft' || approval === 'pending' || approval === 'rejected'
  if (!builder.is_active && !isApplicant) {
    await supabase.auth.signOut()
    return fail('inactive')
  }

  /* 관리자 입구(/admin/login)로 시작한 구글 로그인은 관리자 계정만 통과시킨다.
     비밀번호 경로(admin/login/_actions.ts)와 같은 규칙이다 — 문이 자격을 본다. */
  if (loginPath === '/admin/login' && builder.role !== 'admin') {
    await supabase.auth.signOut()
    return fail('not-admin')
  }

  return NextResponse.redirect(`${origin}${builder.is_active ? next : '/admin/builder/profile'}`)
}
