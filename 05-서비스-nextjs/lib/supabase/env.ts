import { z } from 'zod'

/* Supabase 환경변수 — 한 곳에서 읽고, 한 번만 검증한다.

   이 저장소의 규칙은 "키가 없으면 연동만 꺼지고 사이트는 그대로 동작한다"이다
   (pluug · 채널톡 · GA4 와 같다). Supabase 도 같은 규칙을 따른다:
   비어 있으면 어드민이 목업 모드로 남고, 공개 페이지는 아무 영향도 받지 않는다.

   ⚠ 다만 **반쯤 설정된 상태는 허용하지 않는다.** URL 만 있고 키가 없으면 로그인 화면까지는
     그려지고 요청에서 실패한다 — "왜 로그인이 안 되지"를 한참 뒤에 발견하게 된다.
     그래서 둘 중 하나만 채워져 있으면 즉시 빌드를 깨뜨린다.

   🔴 SUPABASE_SERVICE_ROLE_KEY 는 여기서 읽지 않는다. 그 키는 RLS 를 통째로 우회하므로
      브라우저 번들에 들어갈 수 있는 모듈이 손대면 안 된다. 필요해지면 서버 전용 모듈에서
      따로 읽는다. */

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

const configuredSchema = z.object({
  url: z.url({ error: 'NEXT_PUBLIC_SUPABASE_URL 이 올바른 주소가 아닙니다' }),
  anonKey: z.string().min(20, { error: 'NEXT_PUBLIC_SUPABASE_ANON_KEY 가 너무 짧습니다' }),
})

const filled = [rawUrl, rawAnonKey].filter(v => v.trim() !== '').length

if (filled === 1) {
  throw new Error(
    'Supabase 설정이 반만 채워져 있습니다. NEXT_PUBLIC_SUPABASE_URL 과 ' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY 는 둘 다 넣거나 둘 다 비워야 합니다. ' +
    '(둘 다 비우면 어드민이 목업 모드로 남습니다)',
  )
}

/** 키가 다 있는가. false 면 어드민은 저장·로그인 없는 목업으로 동작한다. */
export const isSupabaseConfigured = filled === 2

/** 설정됐을 때만 유효한 값. 안 됐으면 접근 시 예외 — 조용히 빈 문자열로 요청하지 않게. */
export function supabaseEnv(): { url: string; anonKey: string } {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase 가 설정되지 않았습니다. isSupabaseConfigured 로 먼저 확인하세요.')
  }
  return configuredSchema.parse({ url: rawUrl, anonKey: rawAnonKey })
}
