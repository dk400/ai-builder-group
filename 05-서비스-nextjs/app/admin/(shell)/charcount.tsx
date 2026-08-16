'use client'

/* 글자 수 표시.

   상한은 감이 아니라 실측이다. 값이 실제로 렌더되는 상자를 재고, 글자를 늘려 가며 몇 자에서
   줄이 하나 더 생기는지 확인해 정한다 (Range 로 줄을 직접 세야 한다 — word-break: keep-all
   때문에 같은 글자 수여도 어절 구성에 따라 접히는 지점이 달라진다).

   막지 않고 알려만 준다. maxLength 로 잘라 버리면 붙여넣기가 조용히 잘려서, 쓴 사람은
   무엇이 사라졌는지도 모른 채 저장하게 된다. */
export default function CharCount({ value, rec, max }: { value: string; rec: number; max: number }) {
  const n = value.length
  const state = n > max ? 'over' : n > rec ? 'warn' : 'ok'
  return (
    <span className={`cc cc--${state}`} aria-live="polite">
      {n} / {max}
    </span>
  )
}
