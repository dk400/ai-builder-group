import type { Metadata } from 'next'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { safeNext } from '@/app/admin/login/_next'
import LoginView from '@/app/admin/login/view'
import '../../admin/admin.css'

export const metadata: Metadata = {
  title: '빌더 로그인 — AI 빌더 그룹',
  robots: { index: false, follow: false, nocache: true },
}

const ERROR_MESSAGE: Record<string, string> = {
  oauth: '구글 로그인에 실패했습니다. 다시 시도해 주세요.',
  credentials: '이메일 또는 비밀번호가 올바르지 않습니다.',
  'no-account': '발급된 빌더 계정이 없습니다. 관리자에게 계정 발급을 요청하세요.',
  inactive: '해지된 계정입니다. 관리자에게 문의하세요.',
}

export default async function BuilderLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const sp = await searchParams
  const error = sp.error ? (ERROR_MESSAGE[sp.error] ?? ERROR_MESSAGE.oauth!) : null

  return (
    <div className="adm">
      <LoginView
        configured={isSupabaseConfigured}
        next={safeNext(sp.next)}
        error={error}
        audience="builder"
      />
    </div>
  )
}
