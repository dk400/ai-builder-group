import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseEnv } from './env'

/* 미들웨어에서 세션을 갱신하고 사용자 정보를 돌려준다.

   서버 컴포넌트는 렌더 중에 쿠키를 쓸 수 없어서 토큰을 갱신하지 못한다. 그 일을 매 요청마다
   여기서 한다 — 이 파일이 없으면 액세스 토큰이 만료되는 순간 사용자가 로그아웃된다.

   🔴 응답 객체를 새로 만들면 갱신된 쿠키가 사라진다. 아래 supabaseResponse 를 그대로
      돌려주거나, 새 응답을 만들 때 쿠키를 옮겨 담아야 한다. Supabase 문서가 이 실수를
      가장 흔한 것으로 꼽는다. */

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const { url, anonKey } = supabaseEnv()

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        supabaseResponse = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options)
        }
      },
    },
  })

  /* getUser() 여야 한다. getSession() 은 쿠키를 검증 없이 믿는다.
     이 호출이 곧 토큰 갱신 트리거이기도 하다 — 지우면 세션이 안 늘어난다. */
  const { data } = await supabase.auth.getUser()

  return { response: supabaseResponse, user: data.user }
}

/** 리다이렉트하면서 갱신된 세션 쿠키를 잃지 않게 옮겨 담는다. */
export function redirectKeepingSession(to: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(to)
  for (const cookie of from.cookies.getAll()) {
    redirect.cookies.set(cookie)
  }
  return redirect
}
