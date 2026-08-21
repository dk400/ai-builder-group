import { isSupabaseConfigured } from '@/lib/supabase/env'
import { safeNext } from './_next'
import LoginView from './view'

/* A-01 로그인.

   Supabase 키가 있으면 이메일·비밀번호를 검증하고, 없으면 시연용 목업으로 동작한다.

   실패 사유는 여기서 문구로 바꾼다. 콜백 라우트는 코드만 넘긴다(?error=) — 라우트 핸들러가
   한국어 문장을 들고 있으면 문구를 고칠 때 두 곳을 고쳐야 한다. */

const ERROR_MESSAGE: Record<string, string> = {
  oauth: '구글 로그인에 실패했습니다. 다시 시도해 주세요.',
  credentials: '이메일 또는 비밀번호가 올바르지 않습니다.',
  /* 사유를 구분해 알려도 되는 경우다 (FR-A01-03 의 대상이 아니다). 그 조항은 비밀번호
     로그인에서 "어떤 이메일이 등록돼 있는지" 새는 것을 막으려는 것이고, 여기서는 이미
     본인 구글 계정으로 인증을 마친 사람에게 자기 계정 상태를 알려 주는 것이다.
     알려 주지 않으면 무엇을 해야 할지 알 수 없다 — 계정 발급이 관리자 몫이기 때문이다. */
  'no-account': '발급된 계정이 없는 구글 계정입니다. 관리자에게 계정 발급을 요청하세요.',
  inactive: '해지된 계정입니다. 관리자에게 문의하세요.',
  /* 관리자 입구에 빌더 계정으로 들어온 경우. 계정이 있고 인증도 통과했으므로
     '없는 계정' 과 구분해 알려 준다 — 어디로 가야 하는지가 이 화면의 유일한 다음 행동이다 */
  'not-admin': '운영 관리자 계정이 아닙니다. 빌더 로그인(/builder/login)으로 들어와 주세요.',
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const sp = await searchParams
  const error = sp.error ? (ERROR_MESSAGE[sp.error] ?? ERROR_MESSAGE.oauth!) : null

  return <LoginView configured={isSupabaseConfigured} next={safeNext(sp.next)} error={error} audience="admin" />
}
