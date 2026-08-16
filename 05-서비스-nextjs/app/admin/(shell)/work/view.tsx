'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Badge, Empty, FilterBar } from '../ui'
import type { Status } from '../../_mock'

type Row = {
  slug: string; title: string; tag: string; thumb: string
  builders: string[]; status: Status; updated: string
}

export default function WorkListView({ rows, counts }: { rows: Row[]; counts: Record<Status | 'all', number> }) {
  const [active, setActive] = useState<Status | 'all'>('all')
  const [query, setQuery] = useState('')

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(r =>
      (active === 'all' || r.status === active) &&
      (q === '' || r.title.toLowerCase().includes(q) || r.builders.join(' ').toLowerCase().includes(q)))
  }, [rows, active, query])

  return (
    <main id="main">
      <div className="adm-top">
        <div>
          <h1>Work 관리</h1>
          <p className="sub">관리자 시점 — 전체 {rows.length}건이 보입니다. 빌더 계정은 본인 프로젝트만 보입니다.</p>
        </div>
        <div className="adm-top__r">
          <Link className="abtn abtn--ink" href="/admin/work/new">＋ 새 프로젝트</Link>
        </div>
      </div>

      <div className="adm-body">
        <FilterBar
          counts={counts} active={active} onActive={setActive}
          query={query} onQuery={setQuery} placeholder="제목 · 빌더 검색"
        />

        {shown.length === 0 ? (
          <Empty title="조건에 맞는 프로젝트가 없습니다" desc="필터를 바꾸거나 검색어를 지워보세요." />
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th className="thumb"></th>
                <th>제목</th>
                <th>분야</th>
                <th>참여 빌더</th>
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
                    <Link className="t" href={`/admin/work/${encodeURIComponent(r.slug)}`}>{r.title}</Link>
                    <span className="sub">/work/{r.slug}</span>
                  </td>
                  <td className="muted">{r.tag}</td>
                  <td className="muted">{r.builders.join(' · ')}</td>
                  <td><Badge status={r.status} /></td>
                  <td className="muted num">{r.updated}</td>
                  <td className="right">
                    <span className="acts">
                      <Link className="abtn abtn--sm" href={`/admin/work/${encodeURIComponent(r.slug)}`}>편집</Link>
                      <button className="abtn abtn--sm abtn--danger" type="button">삭제</button>
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
