'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { AUTO_LOGIN_COOKIE } from '@/lib/supabase/auth-cookie'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { safeLoginPath, safeNext } from './_next'

/* A-01 로그인 — Google OAuth (FR-A01-01)

   왜 서버 액션인가 — DR-02 가 "브라우저에서 Supabase 를 직접 호출하지 않는다"이다. 그래서
   이 저장소에는 브라우저용 Supabase 클라이언트가 아예 없다(lib/supabase 에 client.ts 가 없는
   것이 실수가 아니다). signInWithOAuth 를 서버에서 부르면 인증 URL 만 돌려주므로, 그 주소로
   서버가 리다이렉트한다. 브라우저는 구글과만 이야기한다.

   PKCE 검증값(code_verifier)은 이때 쿠키에 심긴다. 서버 액션은 쿠키를 쓸 수 있어서 성립하는
   구조다 — 서버 컴포넌트에서 부르면 검증값이 저장되지 않고 콜백에서 교환이 실패한다.

   ⚠ 계정을 여기서 만들지 않는다 (FR-A01-02 — 자체 회원가입 없음). 구글 로그인은 "이미 발급된
     계정의 문을 여는 방법"일 뿐이고, builders 에 행이 없는 사람은 콜백에서 되돌려보낸다.
     그 판정은 app/auth/callback/route.ts 에 있다. */

/* 콜백 주소의 출처.

   프리뷰 배포마다 도메인이 달라서 SITE_URL 하나로는 못 맞춘다. 실제 요청 호스트를 쓰되,
   실도메인이 정해져 NEXT_PUBLIC_SITE_URL 이 채워져 있으면 그쪽을 우선한다.
   ⚠ Host 헤더는 위조될 수 있다. 최종 방어선은 Supabase 대시보드의 Redirect URLs 허용 목록이다
     — 거기 없는 주소로는 구글이 돌려보내지 않는다. */
async function callbackOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')

  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (!host) return 'http://localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNext(formData.get('next')?.toString())
  const loginPath = safeLoginPath(formData.get('loginPath')?.toString())

  /* 키가 없으면 목업 모드다 — 이 저장소의 규칙("키가 없으면 연동만 꺼진다")대로
     로그인 화면 전체가 시연용이라 그냥 들여보낸다. proxy.ts 도 같은 조건으로 통과시킨다. */
  if (!isSupabaseConfigured) redirect(next)

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${await callbackOrigin()}/auth/callback?next=${encodeURIComponent(next)}&loginPath=${encodeURIComponent(loginPath)}`,
      /* 계정 선택 화면을 항상 띄운다. 개인 구글로 한 번 로그인하면 그 세션이 남아서
         회사 계정으로 바꿀 방법이 화면에 없다 — 실제로 자주 막히는 지점이다. */
      queryParams: { prompt: 'select_account' },
    },
  })

  if (error || !data.url) redirect(`${loginPath}?error=oauth&next=${encodeURIComponent(next)}`)

  /* redirect() 는 예외를 던져 흐름을 끊는다 — 아래에 코드를 두지 말 것 */
  redirect(data.url)
}

const passwordLoginSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(8).max(200),
  next: z.string().optional(),
  autoLogin: z.literal('on').optional(),
})

/** 이메일·비밀번호 로그인. 실패 사유는 계정 존재 여부가 드러나지 않게 하나로 합친다. */
export async function signInWithPassword(formData: FormData): Promise<void> {
  const loginPath = safeLoginPath(formData.get('loginPath')?.toString())
  const parsed = passwordLoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    next: formData.get('next')?.toString(),
    autoLogin: formData.get('autoLogin')?.toString(),
  })
  const next = safeNext(parsed.success ? parsed.data.next : undefined)
  const fail = (reason: string): never =>
    redirect(`${loginPath}?error=${reason}&next=${encodeURIComponent(next)}`)

  if (!isSupabaseConfigured) redirect(next)
  if (!parsed.success) {
    redirect(`${loginPath}?error=credentials&next=${encodeURIComponent(next)}`)
  }
  const credentials = parsed.data
  const autoLogin = credentials.autoLogin === 'on'

  const supabase = await createSupabaseServerClient({ persistentSession: autoLogin })
  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })
  if (error) fail('credentials')

  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) {
    redirect(`${loginPath}?error=credentials&next=${encodeURIComponent(next)}`)
  }
  const userId = auth.user.id

  const { data: builder } = await supabase
    .from('builders')
    .select('is_active, role')
    .eq('auth_user_id', userId)
    .maybeSingle()

  const approval = auth.user.app_metadata.builder_approval
  const isApplicant = approval === 'draft' || approval === 'pending' || approval === 'rejected'
  if (!builder) {
    await supabase.auth.signOut()
    redirect(`${loginPath}?error=no-account&next=${encodeURIComponent(next)}`)
  }
  if (!builder.is_active && !isApplicant) {
    await supabase.auth.signOut()
    redirect(`${loginPath}?error=inactive&next=${encodeURIComponent(next)}`)
  }
  /* 입구가 자격을 검사한다 — 관리자 로그인(/admin/login)은 관리자 계정만 통과시킨다.

     인증에 성공했다는 것과 이 문으로 들어와도 된다는 것은 다른 이야기다. 예전에는 빌더
     계정으로도 관리자 입구를 통과했고, 들어간 뒤 영역 가드가 /admin/builder 로 되돌려
     보냈다 — 되돌려 보내는 것과 처음부터 막는 것은 다르다. 세션을 즉시 없애서
     "관리자 화면에 로그인된 상태" 자체를 만들지 않는다. */
  if (loginPath === '/admin/login' && builder.role !== 'admin') {
    await supabase.auth.signOut()
    redirect(`${loginPath}?error=not-admin&next=${encodeURIComponent(next)}`)
  }

  const cookieStore = await cookies()
  cookieStore.set(AUTO_LOGIN_COOKIE, autoLogin ? '1' : '0', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    ...(autoLogin ? { maxAge: 60 * 60 * 24 * 365 } : {}),
  })

  redirect(builder.is_active ? next : '/admin/builder/profile')
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
  }
  redirect('/admin/login')
}
