/** 로그인 후 돌아갈 곳. 열린 리다이렉트가 되지 않게 /admin 내부 경로만 통과시킨다.

    proxy.ts 가 `?next=` 를 붙여 보내고 받는 쪽에서 다시 검사하는 것이 이 저장소의 규약이다.
    ⚠ '//evil.com' 은 브라우저가 절대 주소로 읽는다 — '/admin' 으로 시작하는지만 봐서는 뚫린다.

    'use server' 파일이 아니라 여기 둔다. 서버 액션 모듈의 export 는 전부 원격 호출 지점이
    되므로, 순수 함수를 거기 두면 쓰지도 않는 엔드포인트가 하나 생긴다. */
export function safeNext(raw: string | null | undefined): string {
  const fallback = '/admin/insight'
  if (!raw) return fallback
  if (!raw.startsWith('/admin') || raw.startsWith('//')) return fallback
  return raw
}

/** 로그인 실패 시 돌아갈 역할별 진입점. 폼 값은 허용 목록으로만 받는다. */
export function safeLoginPath(raw: string | null | undefined): '/admin/login' | '/builder/login' {
  return raw === '/builder/login' ? '/builder/login' : '/admin/login'
}
