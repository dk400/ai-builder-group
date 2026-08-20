/* 콘텐츠 상태 머신 — PRD §7.3 (DR-06 · DR-07 · DR-08 · FR-A07-04)

   같은 규칙이 세 곳에서 필요하다:

     화면      어떤 버튼을 그릴지 (빌더에게 '공개' 버튼을 그리면 안 된다)
     서버 액션 요청이 실제로 허용되는지
     DB 트리거 마지막 방어선 (supabase/schema.sql §7)

   규칙을 세 곳에 각각 적으면 반드시 갈라진다 — 화면에서만 막히고 요청은 통과하는 상태가
   가장 흔한 사고다. 그래서 **표는 여기 하나**를 쓰고, 서버가 이 표로 판정하고, DB 가 같은
   내용을 한 번 더 강제한다. 규칙을 바꾸면 schema.sql §7 도 같이 바꿔야 한다.

   이 파일은 순수 데이터·함수만 둔다. 세션이나 DB 를 건드리지 않으므로 클라이언트 컴포넌트도
   그대로 import 할 수 있다. 세션이 필요한 판정은 app/admin/_authz.ts 다.

     draft ──제출──▶ pending ──승인──▶ published ──내림──▶ archived
       ▲               │                                     │
       └──반려+사유────┘◀────────────복구─────────────────────┘
*/

export type Status = 'draft' | 'pending' | 'published' | 'rejected' | 'archived'
export type Role = 'admin' | 'builder'

export const STATUS_LABEL: Record<Status, string> = {
  draft: '초안',
  pending: '승인대기',
  published: '발행',
  rejected: '반려',
  archived: '보관',
}

export const STATUS_ORDER: Status[] = ['draft', 'pending', 'published', 'rejected', 'archived']

/** 공개 사이트에 나가는 상태. sitemap 도 이 값만 싣는다 */
export const PUBLIC_STATUS: Status = 'published'

export type Transition = {
  from: Status
  to: Status
  /** 버튼에 쓰는 라벨 */
  label: string
  /** 관리자만 할 수 있는가 */
  adminOnly: boolean
  /** 사유 입력이 필수인가 (FR-A07-04) */
  needsReason?: boolean
  /** 파괴적이라 확인 모달을 거쳐야 하는가 (FR-A00-06) */
  confirm?: boolean
}

export const TRANSITIONS: Transition[] = [
  { from: 'draft', to: 'pending', label: '검토 요청', adminOnly: false },
  { from: 'pending', to: 'published', label: '승인 · 공개', adminOnly: true, confirm: true },
  { from: 'pending', to: 'rejected', label: '반려', adminOnly: true, needsReason: true, confirm: true },
  { from: 'rejected', to: 'draft', label: '수정하기', adminOnly: false },
  { from: 'published', to: 'archived', label: '내리기', adminOnly: true, confirm: true },
  { from: 'archived', to: 'published', label: '다시 공개', adminOnly: true, confirm: true },
]

/** 이 상태에서 이 역할이 누를 수 있는 것들. 화면은 이 목록으로만 버튼을 그린다.
    (권한 없는 버튼은 비활성으로 보여주지 않고 아예 두지 않는다 — PRD §2.2) */
export function allowedTransitions(from: Status, role: Role): Transition[] {
  return TRANSITIONS.filter(t => t.from === from && (role === 'admin' || !t.adminOnly))
}

export function findTransition(from: Status, to: Status): Transition | undefined {
  return TRANSITIONS.find(t => t.from === from && t.to === to)
}

export function canTransition(from: Status, to: Status, role: Role): boolean {
  const t = findTransition(from, to)
  return t !== undefined && (role === 'admin' || !t.adminOnly)
}

/** 이 상태를 이 역할이 편집할 수 있는가 — PRD §7.3 "편집 주체" 열 그대로.

    ⚠ 이전 구현은 pending 만 잠갔다. 표는 published · archived 도 관리자 전용으로 적어 놓았는데
      빌더가 발행된 글을 고칠 수 있는 상태였다. 공개 중인 글이 검수 없이 바뀌는 경로다. */
export function canEdit(status: Status, role: Role): boolean {
  if (role === 'admin') return true
  return status === 'draft' || status === 'rejected'
}

export type LockNotice = { title: string; body: string }

/** 왜 잠겼는지. 화면마다 다르게 적으면 같은 상태에 다른 설명이 붙는다 — 문구도 한 곳에 둔다 */
export function lockReason(status: Status, role: Role): LockNotice | null {
  if (canEdit(status, role)) return null
  switch (status) {
    case 'pending':
      return {
        title: '검토 중입니다 — 지금은 수정할 수 없습니다',
        body: '제출한 글은 검수가 끝날 때까지 잠깁니다. 검수 중에 원본이 바뀌면 승인한 내용과 공개된 내용이 달라지기 때문입니다. 고칠 곳을 찾았다면 관리자에게 반려를 요청하세요 — 반려되면 사유와 함께 다시 편집할 수 있습니다.',
      }
    case 'published':
      return {
        title: '이미 발행된 글입니다',
        body: '공개 중인 글은 관리자가 수정합니다. 고칠 곳이 있으면 관리자에게 알려 주세요. 관리자가 글을 내리면(보관) 다시 작업할 수 있습니다.',
      }
    case 'archived':
      return {
        title: '보관된 글입니다',
        body: '공개에서 내려간 글입니다. 다시 공개하거나 수정하는 것은 관리자만 할 수 있습니다.',
      }
    default:
      return { title: '지금은 수정할 수 없습니다', body: '' }
  }
}

/** DR-08 — 내린 글의 주소는 404 가 아니라 301 이다. 색인과 공유 링크를 버리지 않는다 */
export function needsRedirectOnArchive(to: Status): boolean {
  return to === 'archived'
}
