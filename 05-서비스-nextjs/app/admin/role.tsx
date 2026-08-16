'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ADMIN_ACCOUNT, BUILDER_ME } from './_mock'

/* 목업용 역할 전환.

   PRD §2.2 의 권한 모델은 표로만 있으면 확인할 수 없다 — 빌더로 들어가면 무엇이 사라지는지
   눈으로 봐야 검수가 된다. 그래서 인증 없이 역할만 갈아 끼우는 스위치를 둔다.

   ⚠ 이건 목업 전용이다. 실제 구현에서 역할 판정은 서버에서만 한다 (FR-A00-01 —
   "미인증 요청이 서버에서 차단됨, 클라이언트 판정 금지"). 지금은 모든 행을 클라이언트로
   내려보내고 화면에서 거르지만, 진짜는 쿼리 단계에서 걸러야 하고 RLS 가 한 번 더 막는다.
   여기서 거르는 코드를 그대로 4단계로 가져가면 안 된다.

   localStorage 를 쓰므로 첫 페인트는 항상 관리자다 — 마운트 후 한 프레임 안에 바뀐다. */

export type Role = 'admin' | 'builder'

type Ctx = { role: Role; me: string; setRole: (r: Role) => void }
const RoleCtx = createContext<Ctx>({ role: 'admin', me: ADMIN_ACCOUNT, setRole: () => {} })

const KEY = 'abg-admin-mock-role'

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('admin')

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY)
    if (saved === 'builder' || saved === 'admin') setRoleState(saved)
  }, [])

  const setRole = (r: Role) => {
    setRoleState(r)
    window.localStorage.setItem(KEY, r)
  }

  const me = role === 'admin' ? ADMIN_ACCOUNT : BUILDER_ME
  return <RoleCtx.Provider value={{ role, me, setRole }}>{children}</RoleCtx.Provider>
}

export function useRole() {
  return useContext(RoleCtx)
}

export function RoleSwitch() {
  const { role, setRole } = useRole()
  return (
    <span className="adm-roleswitch">
      <span className="lbl">보는 사람</span>
      <button type="button" className={role === 'admin' ? 'on' : undefined}
        aria-pressed={role === 'admin'} onClick={() => setRole('admin')}>
        운영 관리자
      </button>
      <button type="button" className={role === 'builder' ? 'on' : undefined}
        aria-pressed={role === 'builder'} onClick={() => setRole('builder')}>
        빌더 리아
      </button>
    </span>
  )
}
