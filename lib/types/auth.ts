/** Claims the backend signs into the access token (backend JwtPayload, plus the standard exp). */
export interface AccessTokenClaims {
  sub?: string;
  email?: string;
  role?: string;
  orgId?: string | null;
  teamId?: string | null;
  /** Expiry, in seconds since the epoch. */
  exp?: number;
}
