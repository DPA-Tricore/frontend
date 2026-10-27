import type { AccessTokenClaims } from '@/lib/types/auth';

/**
 * Reads a JWT's claims without verifying it — the server still checks the
 * signature on every request. JWTs use base64url, which atob can't read as-is.
 */
export function decodeJwt(token: string): AccessTokenClaims | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

/** True for an expired or unreadable token — either way the server would reject it. */
export function isJwtExpired(token: string): boolean {
  const exp = decodeJwt(token)?.exp;
  return !exp || exp * 1000 <= Date.now();
}
