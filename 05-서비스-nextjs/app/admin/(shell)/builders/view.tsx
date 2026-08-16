'use client'

type Row = {
  slug: string; name: string; email: string
  role: 'admin' | 'builder'; roleLabel: string; avatar: string
  active: boolean; lastLogin: string; done: number
}

export default function BuildersView({ rows }: { rows: Row[] }) {
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
                  <img src={r.avatar} alt="" loading="lazy" style={{ width: 34, height: 34, borderRadius: '50%' }} />
                </td>
                <td>
                  <span className="t">{r.name}</span>
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
                    <button className="abtn abtn--sm" type="button">프로필 편집</button>
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

        <p className="hint" style={{ marginTop: 14, fontSize: 12.5, color: 'var(--muted)' }}>
          ※ 계정을 회수해도 그 빌더가 작성한 글과 프로젝트는 그대로 남습니다 · 관리자 승격은 화면에서 할 수 없습니다
        </p>
      </div>
    </main>
  )
}
