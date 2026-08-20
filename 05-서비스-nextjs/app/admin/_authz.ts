import { cache } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { canEdit, canTransition, findTransition, type Role, type Status } from './_transitions'

/* 권한 판정 — NFR-11 의 "서버 액션" 층.

   proxy.ts 는 **인증**만 본다(로그인했는가). 여기서는 **권한**을 본다(이걸 할 수 있는가).
   역할은 DB 의 `builders.role` 이 원천이다 — 클라이언트가 보낸 값이나 목업의 역할 스위치를
   절대 믿지 않는다.

   ⚠ 이 모듈은 next/headers 를 타는 Supabase 클라이언트를 쓰므로 서버에서만 동작한다.
     클라이언트 컴포넌트에서 import 하면 빌드가 깨진다 — 그게 의도된 안전장치다.
     화면이 버튼을 그릴 때 쓰는 순수 규칙은 ./_transitions.ts 에 있다.

   ⚠ 그리고 이것으로 끝이 아니다. 여기를 통과해도 실제 쿼리는 RLS 를 한 번 더 지난다.
     앱 코드에 구멍이 나도 DB 가 막게 하려는 것이다 (DR-04). */

export type Viewer = {
  userId: string
  /** builders.id — 콘텐츠의 created_by · author_id 와 맞물리는 값 */
  builderId: string
  slug: string
  name: string
  role: Role
}

export class AuthzError extends Error {
  constructor(message: string, readonly status: 401 | 403 = 403) {
    super(message)
    this.name = 'AuthzError'
  }
}

/* 한 요청 안에서 여러 번 불러도 조회는 한 번만 나간다.
   목록 화면 하나가 행마다 권한을 물어보면 그대로 N+1 이 된다. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!isSupabaseConfigured) return null

  const supabase = await createSupabaseServerClient()

  /* getUser() 여야 한다 — getSession() 은 쿠키를 검증 없이 믿는다 */
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return null

  /* select * 를 쓰지 않는다 (DR-03). 필요한 컬럼만 명시한다 */
  const { data, error } = await supabase
    .from('builders')
    .select('id, slug, name, role, is_active')
    .eq('auth_user_id', auth.user.id)
    .maybeSingle()

  if (error || !data) return null

  /* 회수된 계정은 로그인 세션이 남아 있어도 접근시키지 않는다 (FR-A01-05 · FR-A06-03).
     세션 만료를 기다리면 "해지했는데 아직 들어와 있다"가 생긴다. */
  if (!data.is_active) return null

  return {
    userId: auth.user.id,
    builderId: data.id,
    slug: data.slug,
    name: data.name,
    role: data.role === 'admin' ? 'admin' : 'builder',
  }
})

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer()
  if (!viewer) throw new AuthzError('로그인이 필요합니다.', 401)
  return viewer
}

export async function requireAdmin(): Promise<Viewer> {
  const viewer = await requireViewer()
  if (viewer.role !== 'admin') throw new AuthzError('관리자만 할 수 있습니다.')
  return viewer
}

/** 본인 글이거나 관리자여야 한다 (FR-A02-01 · FR-A06-05) */
export function assertOwnership(viewer: Viewer, ownerId: string | null): void {
  if (viewer.role === 'admin') return
  if (ownerId !== viewer.builderId) throw new AuthzError('본인이 작성한 것만 다룰 수 있습니다.')
}

export function assertCanEdit(viewer: Viewer, status: Status): void {
  if (!canEdit(status, viewer.role)) {
    throw new AuthzError('검토 요청 후에는 수정할 수 없습니다. 반려를 요청하세요.')
  }
}

/** 상태 전이 한 건을 검증한다. 표는 ./_transitions.ts 하나뿐이고 DB 트리거가 같은 것을 강제한다 */
export function assertCanTransition(
  viewer: Viewer,
  from: Status,
  to: Status,
  reason: string | null,
): void {
  const transition = findTransition(from, to)
  if (!transition) throw new AuthzError(`허용되지 않은 상태 전이입니다: ${from} → ${to}`)
  if (!canTransition(from, to, viewer.role)) {
    throw new AuthzError(`${transition.label} 은(는) 관리자만 할 수 있습니다.`)
  }
  if (transition.needsReason && (reason === null || reason.trim() === '')) {
    throw new AuthzError('반려 사유는 필수입니다.')
  }
}
