'use client'

import Link from 'next/link'
import { useRole } from '../../role'
import ProfileForm, { type Profile } from './profile'

type Row = {
  slug: string; name: string; email: string
  role: 'admin' | 'builder'; roleLabel: string; avatar: string
  active: boolean; lastLogin: string; done: number
}

export default function BuildersView({ rows, profiles }: { rows: Row[]; profiles: Profile[] }) {
  const { role, me } = useRole()
  const isAdmin = role === 'admin'

  /* 빌더에게는 목록을 보여줄 이유가 없다 — 볼 수 있는 계정이 자기 하나뿐이라(FR-A06-05)
     한 줄짜리 표에 '편집' 버튼을 두면 클릭이 한 번 늘 뿐이다. 바로 편집 폼을 연다. */
  if (!isAdmin) {
    const mine = profiles.find(p => p.slug === me)
    /* 단일 컬럼 화면이다. 넓은 화면에서 왼쪽에만 붙어 있으면 오른쪽 절반이 통째로 비어
       균형이 깨진다 — .adm-narrow 가 머리말과 본문을 같은 축으로 가운데 정렬한다 */
    return (
      <main id="main" className="adm-narrow">
        <div className="adm-top">
          <div>
            <h1>내 프로필</h1>
            <p className="sub">여기서 고친 내용은 공개 사이트의 빌더 프로필에 그대로 나갑니다.</p>
          </div>
          <div className="adm-top__r">
            {mine && (
              <Link className="abtn" href={`/builder?b=${mine.slug}`} target="_blank" rel="noopener noreferrer">
                공개 화면 보기 ↗
              </Link>
            )}
          </div>
        </div>
        <div className="adm-body">
          {mine
            ? <ProfileForm p={mine} canEditAccount={false} />
            : <div className="adm-empty"><h3>계정을 찾을 수 없습니다</h3><p>관리자에게 문의해 주세요.</p></div>}
        </div>
      </main>
    )
  }

  const active = rows.filter(r => r.active).length

  return (
    <main id="main">
      <div className="adm-top">
        <div>
          <h1>빌더 관리</h1>
          {/* 기수가 늘수록 계정이 계속 증가한다 — 발급만큼 회수 절차가 중요하다 (기획서 §5.6) */}
          <p className="sub">계정 {rows.length}개 · 활성 {active}개. 자체 회원가입은 없고, 여기서만 발급합니다.</p>
        </div>
        <div className="adm-top__r">
          <button className="abtn abtn--ink" type="button">＋ 계정 발급</button>
        </div>
      </div>

      <div className="adm-body">
        <table className="adm-table">
          <thead>
            <tr>
              <th className="thumb"></th>
              <th>이름</th>
              <th>이메일</th>
              <th>역할</th>
              <th>수행</th>
              <th>최근 로그인</th>
              <th>상태</th>
              <th className="right">작업</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.slug}>
                <td className="thumb">
                  <img src={r.avatar} alt="" loading="lazy"
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
                </td>
                <td>
                  <Link className="t" href={`/admin/builders/${r.slug}`}>{r.name}</Link>
                  <span className="sub">{r.roleLabel}</span>
                </td>
                <td className="muted">{r.email}</td>
                <td>
                  {/* 관리자 승격은 화면에서 할 수 없다 — DB 직접 변경으로만 가능하다 (PRD §2.2).
                      권한 상승 경로를 UI 에 열어 두지 않는다는 뜻이라 배지로만 표시한다. */}
                  <span className={'st ' + (r.role === 'admin' ? 'st--published' : '')}>
                    {r.role === 'admin' ? 'ADMIN' : 'BUILDER'}
                  </span>
                </td>
                <td className="muted num">{r.done}건</td>
                <td className="muted num">{r.lastLogin}</td>
                <td>
                  <span className={'st ' + (r.active ? 'st--published' : 'st--archived')}>
                    {r.active ? '활성' : '회수됨'}
                  </span>
                </td>
                <td className="right">
                  <span className="acts">
                    <Link className="abtn abtn--sm" href={`/admin/builders/${r.slug}`}>프로필 편집</Link>
                    {/* 회수하면 즉시 로그인이 막히지만 작성한 콘텐츠는 남는다 (FR-A06-03) */}
                    {r.active
                      ? <button className="abtn abtn--sm abtn--danger" type="button">회수</button>
                      : <button className="abtn abtn--sm" type="button">재발급</button>}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="hint" style={{ marginTop: 14 }}>
          ※ 계정을 회수해도 그 빌더가 작성한 글과 프로젝트는 그대로 남습니다 · 관리자 승격은 화면에서 할 수 없습니다
        </p>
      </div>
    </main>
  )
}
