export const AUTO_LOGIN_COOKIE = 'abg-auto-login'

export function asSessionCookie<T extends { expires?: Date; maxAge?: number }>(options: T): T {
  return { ...options, expires: undefined, maxAge: undefined }
}
