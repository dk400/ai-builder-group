'use client'

import { STATUS_LABEL, STATUS_ORDER, type Status } from '../_mock'

export function Badge({ status }: { status: Status }) {
  return <span className={`st st--${status}`}>{STATUS_LABEL[status]}</span>
}

/* 상태 필터 + 검색. Insight·Work 목록이 같은 조작부를 쓴다 (FR-A02-01 · FR-A04-01).
   건수는 필터가 걸리기 전 전체 기준으로 센다 — 필터를 누를 때마다 다른 칩의 숫자가
   0 으로 바뀌면 "그 상태에 몇 건이 있나"를 볼 수 없다. */
export function FilterBar({
  counts, active, onActive, query, onQuery, placeholder,
}: {
  counts: Record<Status | 'all', number>
  active: Status | 'all'
  onActive: (s: Status | 'all') => void
  query: string
  onQuery: (q: string) => void
  placeholder: string
}) {
  const chips: Array<Status | 'all'> = ['all', ...STATUS_ORDER]
  return (
    <div className="adm-filter">
      {chips.map(s => (
        <button
          key={s}
          type="button"
          className={'fchip' + (active === s ? ' on' : '')}
          aria-pressed={active === s}
          onClick={() => onActive(s)}
        >
          {s === 'all' ? '전체' : STATUS_LABEL[s]}
          <span className="c">{counts[s]}</span>
        </button>
      ))}
      <div className="adm-search">
        <span aria-hidden="true">⌕</span>
        <input
          type="text"
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="제목 검색"
        />
      </div>
    </div>
  )
}

export function Empty({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="adm-empty">
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  )
}
