import sanitizeHtml from 'sanitize-html'

/* Tiptap 본문 서버 sanitize — NFR-13 · FR-A03-02 · FR-A03-03

   에디터에서 온 HTML 을 그대로 저장하면, 저장하는 순간 XSS 가 DB 에 영속된다. 브라우저에서
   거르는 것은 방어가 아니다 — 요청은 에디터를 거치지 않고도 만들 수 있다. 그래서 **저장 직전
   서버에서** 한 번 거른다.

   손으로 정규식을 짜지 않는다. HTML 파싱은 예외가 많아서 직접 만든 필터는 거의 항상 뚫린다.
   (`<img src=x onerror=...>` · `javascript:` · `<svg><script>` · 주석 안의 태그 …)

   ── 여기서 하는 일 ────────────────────────────────────────────────────────
   1. 허용 목록에 없는 태그·속성 제거 (script · style · iframe · on* · style 속성 전부)
   2. h1 → h2 강등. 페이지 제목이 h1 이라 본문에 또 있으면 문서 구조가 깨진다 (FR-A03-02)
   3. 제목 id 재생성 — 목차(tocOf)가 `<h2 id="...">` 를 정규식으로 읽는다. 입력으로 들어온
      id 는 믿지 않고 본문 텍스트에서 다시 만든다
   4. 링크에 rel="noopener noreferrer" 부여, 안전한 스킴만 허용

   ⚠ `app/_insights.ts` 의 손으로 쓴 bodyHtml(유튜브 임베드 등)은 에디터 출력이 아니라
     이 필터를 지나지 않는다. 어드민에서 들어오는 값만 여기를 통과한다. */

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
  'h2', 'h3', 'h4',
  'ul', 'ol', 'li',
  'blockquote', 'hr',
  'a', 'img',
  'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

/** 제목 텍스트 → 앵커 id. 한글을 그대로 둔다 — 슬러그 규칙과 같은 이유다 */
function headingId(text: string): string {
  const base = text
    .replace(/<[^>]+>/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
  return base === '' ? 'section' : base.slice(0, 60)
}

export function sanitizeBodyHtml(dirty: string): string {
  const cleaned = sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      /* rel 을 허용 목록에 넣어야 아래 transformTags 가 붙인 값이 살아남는다.
         허용 목록은 transform 이후에 한 번 더 적용된다 — 빠뜨리면 조용히 지워진다. */
      a: ['href', 'title', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      h2: ['id'],
      h3: ['id'],
      h4: ['id'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    /* data: URI 는 허용하지 않는다. 이미지는 Storage 에 올리고 주소로 참조한다 —
       본문에 수 MB 짜리 base64 가 박히면 목록 쿼리까지 함께 무거워진다. */
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    /* 허용 목록 밖 태그는 껍데기만 벗기고 안의 글은 남긴다. 통째로 지우면 사용자가
       "왜 문단이 사라졌지"만 겪고 무엇이 문제였는지는 모른다. */
    nonTextTags: ['script', 'style', 'textarea', 'noscript'],
    transformTags: {
      /* FR-A03-02 — 툴바에서 막아도 붙여넣기로 들어온다. 서버에서 한 번 더 내린다 */
      h1: 'h2',
      h5: 'h4',
      h6: 'h4',
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: 'noopener noreferrer' },
      }),
    },
  })

  /* 목차용 id 재생성. sanitize 뒤에 하는 이유는 그때가 태그가 정리된 상태라서다. */
  const seen = new Map<string, number>()
  return cleaned.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (_all, _attrs: string, inner: string) => {
    const base = headingId(inner)
    const n = seen.get(base) ?? 0
    seen.set(base, n + 1)
    const id = n === 0 ? base : `${base}-${n + 1}`
    return `<h2 id="${id}">${inner}</h2>`
  })
}

/** 한 줄 소개·요약처럼 태그가 필요 없는 값. 전부 텍스트로 만든다. */
export function sanitizePlainText(dirty: string): string {
  return sanitizeHtml(dirty, { allowedTags: [], allowedAttributes: {} }).trim()
}
