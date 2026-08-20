'use client'

import { useEffect, useState } from 'react'
import { toSlug } from '@/lib/slug'

/* 주소(슬러그) 입력 — FR-A03-04 · FR-A03-05

   ⚠ 원래는 빈 칸에 사용자가 직접 타이핑해야 했다. 슬러그는 규칙(한글 유지 · 소문자 ·
     하이픈 · 문장부호 제거)이 있는 값이라 손으로 쓰면 거의 매번 어긋나고, 무엇보다
     **비전공자 빌더에게 "슬러그를 입력하세요"는 아무 의미도 없는 요구**다.

   그래서 세 가지로 나눴다:

     새 글      제목을 쓰면 주소가 따라 만들어진다. 손댈 일이 없다
     저장된 글  자동으로 바꾸지 않는다. 주소는 이미 공유됐을 수 있다
     수정할 때  "주소 수정"을 눌러야 열린다 — 실수로 바뀌는 일이 없게

   발행된 글의 주소를 바꾸면 301 이 자동 생성되지만(SR-06), 그래도 경고를 띄운다.
   리다이렉트가 있어도 공유된 링크의 미리보기·GA4 이력은 갈라진다. */

type Props = {
  name: string
  /** 표시용 접두사. 예: /insight/ */
  base: string
  /** 제목 — 새 글일 때 여기서 주소를 만든다 */
  title: string
  /** 저장돼 있는 슬러그. 비어 있으면 새 글이다 */
  initial: string
  published: boolean
  onDirty?: () => void
  disabled?: boolean
}

export default function SlugField({ name, base, title, initial, published, onDirty, disabled }: Props) {
  const isNew = initial === ''
  const [value, setValue] = useState(initial)
  /* 새 글은 처음부터 제목을 따라간다. 저장된 글은 잠겨 있다 */
  const [autoFollow, setAutoFollow] = useState(isNew)
  const [unlocked, setUnlocked] = useState(isNew)

  useEffect(() => {
    if (autoFollow) setValue(toSlug(title))
  }, [title, autoFollow])

  const changed = !isNew && value !== initial

  return (
    <div className="f">
      <label htmlFor={name}>
        주소 <span className="req">*</span>
        <span className="opt">이 글의 URL 이 됩니다</span>
      </label>

      {!unlocked ? (
        /* 잠긴 상태 — 값은 hidden 으로 그대로 실린다 */
        <div className="slug-locked">
          <code>{base}{value}</code>
          <input type="hidden" name={name} value={value} readOnly />
          <button
            type="button" className="abtn abtn--sm" disabled={disabled}
            onClick={() => { setUnlocked(true); setAutoFollow(false) }}
          >주소 수정</button>
        </div>
      ) : (
        <>
          <div className="slug-row">
            <span className="pre">{base}</span>
            <input
              id={name} name={name} type="text" value={value} disabled={disabled}
              placeholder="제목을 쓰면 자동으로 만들어집니다"
              onChange={e => {
                /* 손으로 고치는 순간 자동 추종을 끈다 — 쓰던 값이 다음 타이핑에 덮이면 안 된다 */
                setAutoFollow(false)
                setValue(toSlug(e.target.value))
                onDirty?.()
              }}
            />
          </div>
          {isNew && autoFollow && (
            <p className="hint">제목을 따라 자동으로 만들어집니다. 직접 고치면 그때부터 멈춥니다.</p>
          )}
        </>
      )}

      {changed && published && (
        <p className="fieldwarn" role="status">
          발행된 글의 주소를 바꿉니다. 구 주소 <code>{base}{initial}</code> 에 301 리다이렉트가
          자동으로 생기지만, 이미 공유된 링크의 미리보기와 GA4 이력은 갈라집니다.
        </p>
      )}
      {changed && !published && (
        <p className="hint">저장하면 주소가 <code>{base}{value}</code> 로 바뀝니다.</p>
      )}
    </div>
  )
}
