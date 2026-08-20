/* 제목 → 슬러그.

   슬러그 규칙은 06-이관/라우트-슬러그-규칙표.md §3 이고, 한글을 그대로 둔다 —
   키워드가 URL 에 남는 것이 목적이라 로마자로 바꾸면 의미가 사라진다.

   ⚠ 결과는 서버의 검증 정규식(app/admin/_actions.ts 의 slugSchema)을 통과해야 한다.
     `^[\p{L}\p{N}][\p{L}\p{N}-]*$` — 첫 글자는 글자나 숫자, 이후는 글자·숫자·하이픈. */

export function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')  // 문장부호 제거 (— · ? ! 등)
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
