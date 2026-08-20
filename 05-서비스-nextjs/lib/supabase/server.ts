import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseEnv } from './env'

/* 서버 컴포넌트 · 서버 액션용 Supabase 클라이언트.

   DR-02 가 "브라우저에서 Supabase 를 직접 호출하지 않는다"를 요구한다. 그래서 클라이언트
   생성기는 이 파일 하나뿐이고, 'use client' 가 붙은 파일에서는 import 되지 않는다.

   ⚠ 세션 쿠키 쓰기는 서버 컴포넌트에서 실패한다(렌더 중에는 응답 헤더를 못 건드린다).
     그래서 setAll 을 조용히 삼킨다 — 대신 **미들웨어가 매 요청마다 세션을 갱신**한다.
     미들웨어가 없으면 토큰이 만료되는 순간 로그아웃되므로, 둘은 세트다.

   ⚠ 인증 여부를 볼 때 getSession() 을 쓰지 않는다. 그건 쿠키를 그대로 믿는 값이라
     위조될 수 있다. getUser() 는 Supabase 에 물어보고 검증한다. */

export async function createSupabaseServerClient() {
  const { url, anonKey } = supabaseEnv()
  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          /* 서버 컴포넌트 렌더 중이면 여기로 온다. 미들웨어가 갱신을 맡으므로 무시해도 된다 */
        }
      },
    },
  })
}
