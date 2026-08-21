'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useRole } from '../../role'
import { Badge } from '../ui'
import { STATUS_LABEL, STATUS_ORDER, type Status } from '../../_transitions'
import type { InsightRow, WorkRow } from '../../_queries'
import type { Pending } from '../../_mock'

/* 대시보드 — 운영 현황 한눈에.

   원작자 설계는 대시보드를 의도적으로 뺐다(E10 · FR-A00-03 — 첫 화면은 A-02). 이 화면은
   그 위에 얹는 추가 화면이라, 새 데이터 계층을 만들지 않고 목록과 **같은 원천**(_queries)만
   집계한다. 숫자가 목록과 어긋나면 대시보드를 아무도 믿지 않는다.

   범위는 목록 뷰와 똑같이 나눈다 — 관리자는 전체, 빌더는 본인 것. 실모드에서는 _queries 가
   이미 쿼리에서 잘라 내려주고(그때 me=builderId 라 owner 와 맞는다), 목업에서는 역할 스위치에
   맞춰 여기서 거른다. work/view.tsx 와 같은 규칙이다. */

type Props = {
  works: WorkRow[]
  insights: InsightRow[]
  pending: Pending[]
  /** 링크 접두. 관리자 '/admin', 빌더 '/admin/builder' — 링크가 영역 밖으로 안 나가게 */
  base: string
}

const count = <T extends { status: Status }>(rows: T[], s: Status) => rows.filter(r => r.status === s).length

export default function DashboardView({ works, insights, pending, base }: Props) {
  const { role, me, name } = useRole()
  const isAdmin = role === 'admin'

  const wk = useMemo(() => (isAdmin ? works : works.filter(w => w.owner === me)), [works, isAdmin, me])
  const ins = useMemo(() => (isAdmin ? insights : insights.filter(i => i.owner === me)), [insights, isAdmin, me])

  const publishedTotal = count(wk, 'published') + count(ins, 'published')
  const pendingTotal = isAdmin ? pending.length : count(wk, 'pending') + count(ins, 'pending')
  const rejectedTotal = count(wk, 'rejected') + count(ins, 'rejected')

  /* 최근 업데이트 — Work·Insight 를 한 줄로 합쳐 수정일 내림차순. 날짜가 'YYYY.MM.DD' 라
     문자열 정렬이 곧 날짜 정렬이다(로케일 포맷터를 안 쓰는 것과 같은 이유). */
  const recent = useMemo(() => {
    const a = [
      ...wk.map(w => ({ kind: 'Work' as const, title: w.title, status: w.status, updated: w.updated, href: `${base}/work/${encodeURIComponent(w.slug)}` })),
      ...ins.map(i => ({ kind: 'Insight' as const, title: i.title, status: i.status, updated: i.updated, href: `${base}/insight/${encodeURIComponent(i.slug)}` })),
    ]
    return a.sort((x, y) => y.updated.localeCompare(x.updated)).slice(0, 6)
  }, [wk, ins, base])

  /* 빌더가 지금 손봐야 할 것 — 반려(사유 보고 고치기)와 초안(제출)을 앞으로 모은다 */
  const todo = useMemo(() => {
    const items = [
      ...wk.map(w => ({ kind: 'Work' as const, title: w.title, status: w.status, href: `${base}/work/${encodeURIComponent(w.slug)}` })),
      ...ins.map(i => ({ kind: 'Insight' as const, title: i.title, status: i.status, href: `${base}/insight/${encodeURIComponent(i.slug)}` })),
    ].filter(x => x.status === 'rejected' || x.status === 'draft')
    const weight = (s: Status) => (s === 'rejected' ? 0 : 1)
    return items.sort((x, y) => weight(x.status) - weight(y.status)).slice(0, 6)
  }, [wk, ins, base])

  return (
    <main id="main">
      <div className="adm-top">
        <div>
          <h1>대시보드</h1>
          <p className="sub">
            {isAdmin ? '운영 관리자 — 전체 콘텐츠 현황' : `${name || '빌더'} — 내 콘텐츠 현황`}
          </p>
        </div>
      </div>

      <div className="adm-body">
        <div className="dash">
          <div className="dash-kpis">
            <Link className="dash-kpi" href={`${base}/work`}>
              <div className="dash-kpi__n">{wk.length}<small>건</small></div>
              <div className="dash-kpi__label">Work</div>
              <div className="dash-kpi__cap">발행 {count(wk, 'published')} · 검수 대기 {count(wk, 'pending')}</div>
            </Link>

            <Link className="dash-kpi" href={`${base}/insight`}>
              <div className="dash-kpi__n">{ins.length}<small>건</small></div>
              <div className="dash-kpi__label">Insight</div>
              <div className="dash-kpi__cap">발행 {count(ins, 'published')} · 검수 대기 {count(ins, 'pending')}</div>
            </Link>

            {isAdmin ? (
              <Link className={'dash-kpi' + (pendingTotal > 0 ? ' dash-kpi--hot' : '')} href={`${base}/approvals`}>
                <div className="dash-kpi__n">{pendingTotal}<small>건</small></div>
                <div className="dash-kpi__label">승인 대기</div>
                <div className="dash-kpi__cap">{pendingTotal > 0 ? '검수를 기다리고 있습니다' : '대기 중인 요청이 없습니다'}</div>
              </Link>
            ) : (
              <div className={'dash-kpi' + (rejectedTotal > 0 ? ' dash-kpi--hot' : '')}>
                <div className="dash-kpi__n">{rejectedTotal}<small>건</small></div>
                <div className="dash-kpi__label">반려</div>
                <div className="dash-kpi__cap">{rejectedTotal > 0 ? '사유를 보고 다시 고쳐 주세요' : '반려된 글이 없습니다'}</div>
              </div>
            )}

            <div className="dash-kpi">
              <div className="dash-kpi__n">{publishedTotal}<small>건</small></div>
              <div className="dash-kpi__label">공개 중</div>
              <div className="dash-kpi__cap">사이트에 발행된 콘텐츠</div>
            </div>
          </div>

          <div className="dash-cards">
            <StatusCard title="Work 상태 분포" href={`${base}/work`} rows={wk} />
            <StatusCard title="Insight 상태 분포" href={`${base}/insight`} rows={ins} />
          </div>

          <div className="dash-bottom">
            <section className="dash-panel">
              <h2>{isAdmin ? '검수 대기 큐' : '지금 할 일'}</h2>
              <p className="sub">
                {isAdmin ? '오래 기다린 순으로. 눌러 바로 검수하세요.' : '반려된 글을 고치고, 초안을 제출하세요.'}
              </p>
              {isAdmin ? (
                pending.length === 0 ? (
                  <div className="dash-empty">대기 중인 요청이 없습니다.</div>
                ) : (
                  pending.slice(0, 6).map(p => (
                    <Link key={p.kind + p.slug} className="dash-row" href={`${base}/${p.kind === 'Work' ? 'work' : 'insight'}/${encodeURIComponent(p.slug)}`}>
                      <span className="dash-row__k">{p.kind}</span>
                      <span className="dash-row__t">{p.title}</span>
                      <span className="dash-row__meta">{p.author} · {p.submitted}</span>
                    </Link>
                  ))
                )
              ) : todo.length === 0 ? (
                <div className="dash-empty">지금 손볼 것이 없습니다. 새 글을 시작해 보세요.</div>
              ) : (
                todo.map(t => (
                  <Link key={t.kind + t.title} className="dash-row" href={t.href}>
                    <span className="dash-row__k">{t.kind}</span>
                    <span className="dash-row__t">{t.title}</span>
                    <Badge status={t.status} />
                  </Link>
                ))
              )}
            </section>

            <section className="dash-panel">
              <h2>최근 업데이트</h2>
              <p className="sub">마지막으로 손댄 순서입니다.</p>
              {recent.length === 0 ? (
                <div className="dash-empty">아직 콘텐츠가 없습니다.</div>
              ) : (
                recent.map(r => (
                  <Link key={r.kind + r.title} className="dash-row" href={r.href}>
                    <span className="dash-row__k">{r.kind}</span>
                    <span className="dash-row__t">{r.title}</span>
                    <Badge status={r.status} />
                    <span className="dash-row__meta">{r.updated}</span>
                  </Link>
                ))
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

/* 상태 분포 막대 + 범례. 색은 admin.css 의 .st--* 와 맞춰 dashboard.css 의 .dash-seg--* 에 둔다 */
function StatusCard({ title, href, rows }: { title: string; href: string; rows: Array<{ status: Status }> }) {
  const total = rows.length
  return (
    <div className="dash-card">
      <div className="dash-card__h">
        <h2>{title}</h2>
        <span className="dash-card__total">전체 {total}건</span>
      </div>
      {total === 0 ? (
        <div className="dash-bar dash-bar--empty" />
      ) : (
        <div className="dash-bar" role="img" aria-label={`${title}: ` + STATUS_ORDER.map(s => `${STATUS_LABEL[s]} ${count(rows as { status: Status }[], s)}`).join(', ')}>
          {STATUS_ORDER.map(s => {
            const n = count(rows as { status: Status }[], s)
            if (n === 0) return null
            return <span key={s} className={`dash-seg dash-seg--${s}`} style={{ width: `${(n / total) * 100}%` }} title={`${STATUS_LABEL[s]} ${n}`} />
          })}
        </div>
      )}
      <div className="dash-legend">
        {STATUS_ORDER.map(s => {
          const n = count(rows as { status: Status }[], s)
          return (
            <span key={s} className={'dash-leg' + (n === 0 ? ' dash-leg--0' : '')}>
              <i className={`dash-seg--${s}`} />
              {STATUS_LABEL[s]} <b>{n}</b>
            </span>
          )
        })}
      </div>
    </div>
  )
}
