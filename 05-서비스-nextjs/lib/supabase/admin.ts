import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const adminEnvSchema = z.object({
  url: z.url(),
  secret: z.string().min(20),
})

/** 가입·승인처럼 RLS를 넘어야 하는 운영 작업 전용. 클라이언트 코드에서 import하지 않는다. */
export function createSupabaseAdminClient() {
  const { url, secret } = adminEnvSchema.parse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  })

  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
