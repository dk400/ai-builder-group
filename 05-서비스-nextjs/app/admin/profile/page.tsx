import { redirect } from 'next/navigation'
import { getViewer } from '@/app/admin/_authz'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { saveMyBuilderProfile } from './actions'

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
  const { data } = await supabase.from('builders')
    .select('name, email, role_label, one_liner, avatar_url')
    .eq('id', viewer.builderId).single()
  if (!data) redirect('/builder/login?error=no-account')

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

        <form className="prof adm-profile" action={saveMyBuilderProfile}>
          <section className="prof-sec">
            <h2>기본 정보 <em>승인 전에도 작성·수정 가능</em></h2>
            <div className="f"><label htmlFor="profileName">이름 <span className="req">*</span></label><input id="profileName" name="name" defaultValue={data.name} required minLength={2} maxLength={30} /></div>
            <div className="f"><label htmlFor="profileEmail">이메일</label><input id="profileEmail" value={data.email} disabled /></div>
            <div className="f"><label htmlFor="roleLabel">전문 분야 <span className="req">*</span></label><input id="roleLabel" name="roleLabel" defaultValue={data.role_label ?? ''} required minLength={2} maxLength={50} placeholder="예) 랜딩 · 인터랙션" /></div>
            <div className="f"><label htmlFor="oneLiner">한 줄 소개 <span className="req">*</span></label><textarea id="oneLiner" name="oneLiner" defaultValue={data.one_liner ?? ''} required minLength={10} maxLength={52} /><p className="hint">10~52자로 작성해 주세요. 승인 후 공개 빌더 카드에 사용됩니다.</p></div>
            <div className="f"><label htmlFor="avatarUrl">프로필 이미지 주소</label><input id="avatarUrl" name="avatarUrl" defaultValue={data.avatar_url ?? ''} placeholder="https://… 또는 /assets/…" /></div>
          </section>
          <div className="adm-actions">
            <span className="warn">승인 전에도 저장할 수 있으며, 승인 요청 후에도 수정 가능합니다.</span>
            <button className="abtn" type="submit" name="intent" value="save">저장</button>
            {viewer.role !== 'admin' && viewer.approval !== 'approved' && (
              <button className="abtn abtn--lime" type="submit" name="intent" value="request">{viewer.approval === 'pending' ? '승인 요청 다시 보내기' : '빌더 승인 요청'}</button>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}
