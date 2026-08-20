'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Badge, Empty, FilterBar } from '../ui'
import { useRole } from '../../role'
import { STATUS_ORDER, countBy, type Status } from '../../_mock'

type Row = {
  slug: string; title: string; catLabel: string; author: string
  thumb: string; status: Status; updated: string; owner: string
}

export default function InsightListView({ rows, counts }: { rows: Row[]; counts: Record<Status | 'all', number> }) {
  const { role, me } = useRole()
  const isAdmin = role === 'admin'
  const [active, setActive] = useState<Status | 'all'>('all')
  const [query, setQuery] = useState('')

  /* 빌더는 본인 글만 본다 (FR-A02-01).
     ⚠ 목업이라 화면에서 거른다. 실제로는 쿼리에서 걸러야 하고 RLS 가 한 번 더 막는다 —
     전체 목록을 브라우저로 내려보낸 뒤 감추는 구현은 요구사항 미충족이다. */
  const mine = useMemo(() => (isAdmin ? rows : rows.filter(r => r.owner === me)), [rows, isAdmin, me])

  const scoped = useMemo(() => {
    if (isAdmin) return counts
    const c = { all: mine.length } as Record<Status | 'all', number>
    for (const s of STATUS_ORDER) c[s] = countBy(mine, s)
    return c
  }, [isAdmin, counts, mine])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return mine.filter(r =>
      (active === 'all' || r.status === active) &&
      (q === '' || r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q)))
  }, [mine, active, query])

  return (
    <main id="main">
      <div className="adm-top">
        <div>
          <h1>Insight 관리</h1>
          <p className="sub">
            {isAdmin
              ? `운영 관리자 — 전체 ${rows.length}건`
              : `빌더 리아 — 내가 쓴 ${mine.length}건만 보입니다`}
          </p>
        </div>
        <div className="adm-top__r">
          <Link className="abtn abtn--ink" href="/admin/insight/new">＋ 새 글</Link>
        </div>
      </div>

      <div className="adm-body">
        <FilterBar
          counts={scoped} active={active} onActive={setActive}
          query={query} onQuery={setQuery} placeholder="제목 · 작성자 검색"
        />

        {shown.length === 0 ? (
          <Empty title="조건에 맞는 글이 없습니다" desc="필터를 바꾸거나 검색어를 지워보세요." />
        ) : (
          <table className="adm-table adm-table--media">
            <thead>
              <tr>
                <th className="thumb"></th>
                <th>제목</th>
                <th>카테고리</th>
                <th>작성자</th>
                <th>상태</th>
                <th>수정일</th>
                <th className="right">작업</th>
              </tr>
            </thead>
            <tbody>
              {shown.map(r => (
                <tr key={r.slug}>
                  <td className="thumb"><img src={r.thumb} alt="" loading="lazy" /></td>
                  <td>
                    <Link className="t" href={`/admin/insight/${encodeURIComponent(r.slug)}`}>{r.title}</Link>
                    <span className="sub">/insight/{r.slug}</span>
                  </td>
                  <td className="muted">{r.catLabel}</td>
                  <td className="muted">{r.author}</td>
                  <td><Badge status={r.status} /></td>
                  <td className="muted num">{r.updated}</td>
                  <td className="right">
                    <span className="acts">
                      {/* 제출한 글은 작성자가 편집할 수 없다 — 잠긴다 (DR-07) */}
                      {!isAdmin && r.status === 'pending'
                        ? <button className="abtn abtn--sm" type="button" disabled title="제출 후에는 편집할 수 없습니다">잠김</button>
                        : <Link className="abtn abtn--sm" href={`/admin/insight/${encodeURIComponent(r.slug)}`}>편집</Link>}
                      {/* 삭제는 관리자만 (FR-A02-02) — 빌더가 눌러도 서버가 403 을 낸다 */}
                      {isAdmin && <button className="abtn abtn--sm abtn--danger" type="button">삭제</button>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
