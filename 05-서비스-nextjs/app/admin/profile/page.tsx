import { redirect } from 'next/navigation'
import { getViewer } from '@/app/admin/_authz'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { saveMyBuilderProfile } from './actions'
import ProfileForm, { type Profile } from '@/app/admin/(shell)/builders/profile'

const STATUS = {
  draft: ['프로필 작성 중', '필수 정보를 채운 뒤 빌더 승인을 요청하세요.'],
  pending: ['승인 검토 중', '검토 중에도 프로필을 계속 수정하고 저장할 수 있습니다.'],
  approved: ['승인 완료', '빌더 기능과 콘텐츠 관리 메뉴를 사용할 수 있습니다.'],
  rejected: ['보완 필요', '프로필을 수정한 뒤 다시 승인을 요청하세요.'],
} as const

export default async function MyProfilePage({ searchParams }: {
  searchParams: Promise<{ saved?: string; requested?: string; error?: string; welcome?: string }>
}) {
  const viewer = await getViewer()
  if (!viewer) redirect('/builder/login')

  const supabase = await createSupabaseServerClient()
  const [{ data }, { data: auth }] = await Promise.all([supabase.from('builders')
    .select('name, email, role_label, one_liner, avatar_url')
    .eq('id', viewer.builderId).single(), supabase.auth.getUser()])
  if (!data) redirect('/builder/login?error=no-account')

  const rawProfile = auth.user?.user_metadata.builder_profile ?? auth.user?.app_metadata.builder_profile
  const extra = rawProfile && typeof rawProfile === 'object' ? rawProfile as Record<string, unknown> : {}
  const principles = Array.isArray(extra.principles)
    ? extra.principles.filter((row): row is [string, string] => Array.isArray(row) && typeof row[0] === 'string' && typeof row[1] === 'string').slice(0, 3)
    : []
  const profile: Profile = {
    slug: viewer.slug,
    no: typeof extra.no === 'string' ? extra.no : '승인 신청',
    name: data.name,
    avatar: data.avatar_url ?? '/icon.svg',
    roleLabel: data.role_label ?? '',
    blurb: data.one_liner ?? '',
    bio: typeof extra.bio === 'string' ? extra.bio : '',
    focus: typeof extra.focus === 'string' ? extra.focus : '',
    stack: Array.isArray(extra.stack) ? extra.stack.filter((item): item is string => typeof item === 'string') : [],
    principles,
    email: data.email,
    account: viewer.role,
    active: viewer.approval === 'approved',
    lastLogin: auth.user?.last_sign_in_at ? new Date(auth.user.last_sign_in_at).toLocaleDateString('ko-KR') : '—',
    done: 0,
  }

  const sp = await searchParams
  const [statusTitle, statusCopy] = STATUS[viewer.approval]

  return (
    <main id="main" className="adm-narrow">
      <div className="adm-top"><div><h1>내 프로필</h1><p className="sub">프로필을 먼저 설정한 뒤 운영 관리자에게 빌더 승인을 요청합니다.</p></div></div>
      <div className="adm-body">
        <div className={`notice notice--approval notice--${viewer.approval}`}>
          <span className="notice__ico" aria-hidden="true">{viewer.approval === 'approved' ? '✓' : '○'}</span>
          <b>{statusTitle}</b><p>{statusCopy}</p>
        </div>
        {(sp.saved || sp.requested || sp.welcome) && <p className="adm-profile__ok" role="status">{sp.requested ? '승인 요청을 보냈습니다.' : sp.welcome ? '계정이 준비되었습니다. 프로필을 작성해 주세요.' : '프로필을 저장했습니다.'}</p>}
        {sp.error && <p className="adm-login__err" role="alert">입력값을 확인하거나 잠시 후 다시 시도해 주세요.</p>}

        <ProfileForm p={profile} canEditAccount={false} action={saveMyBuilderProfile} approval={viewer.approval} />
      </div>
    </main>
  )
}
