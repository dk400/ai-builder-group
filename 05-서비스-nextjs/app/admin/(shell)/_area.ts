import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { getViewer } from '../_authz'

/* 역할별 영역 분리 — 관리자는 `/admin/*`, 빌더는 `/admin/builder/*`.

   같은 셸(사이드바 · 조판)을 쓰지만 주소가 갈린다. 주소를 갈라 두면 "내가 지금 어느
   자격으로 보고 있는지"가 화면이 아니라 주소창에서 먼저 읽히고, 나중에 셸을 통째로
   가를 때도 라우트를 옮길 필요가 없다.

   ⚠ 여기서 하는 것은 **안내**다. 실제 차단은 여전히 세 겹으로 한다 —
     쿼리 범위 제한(_queries), 서버 액션 권한(_authz), RLS. 이 리다이렉트가 뚫려도
     빌더가 남의 데이터를 보지는 못한다. 반대로 이것만 믿고 저 셋을 빼면 안 된다.

   ⚠ 목업(키 없음)에서는 서버가 아는 역할이 없다. 그때는 그냥 통과시킨다 —
     역할 전환 스위치로 두 시점을 오가며 검수하는 것이 목업의 목적이기 때문이다.

   ⚠ 레이아웃이 아니라 페이지에서 부른다. 서버 레이아웃은 현재 경로를 알 수 없어서
     "이 화면만 예외" 를 표현할 수 없다 — 승인 대기 중인 빌더가 프로필 화면에 갇히는
     무한 리다이렉트가 그렇게 만들어진다. */

const BUILDER_HOME = '/admin/builder'
const BUILDER_PROFILE = '/admin/builder/profile'
const ADMIN_HOME = '/admin/insight'

/** 관리자 영역(`/admin/insight` · `/work` · `/approvals` · `/accounts`)의 페이지가 부른다 */
export async function requireAdminArea(): Promise<void> {
  if (!isSupabaseConfigured) return
  const viewer = await getViewer()
  if (!viewer) redirect('/admin/login')
  if (viewer.role !== 'admin') redirect(BUILDER_HOME)
}

/** 빌더 영역(`/admin/builder/*`)의 페이지가 부른다.
    승인 전 빌더는 프로필 화면 하나만 쓸 수 있다 — 그 화면은 이 함수를 부르지 않는다. */
export async function requireApprovedBuilderArea(): Promise<void> {
  if (!isSupabaseConfigured) return
  const viewer = await getViewer()
  if (!viewer) redirect('/admin/login')
  /* 관리자가 빌더 영역 주소를 직접 치면 자기 영역으로 돌려보낸다.
     막으려는 게 아니라 주소를 한 벌로 유지하려는 것이다 — 관리자는 전체를 보는 화면이 따로 있다. */
  if (viewer.role === 'admin') redirect(ADMIN_HOME)
  if (viewer.approval !== 'approved') redirect(BUILDER_PROFILE)
}
