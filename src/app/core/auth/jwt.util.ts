// src/app/core/auth/jwt.util.ts
// Purpose: Wraps jwt-decode to parse Draya JWT access tokens into a typed claims interface.
// Used by AuthService to extract user identity (id, role, email) from the raw JWT string.

import { jwtDecode } from 'jwt-decode';

/** Typed claims extracted from a Draya JWT access token. */
export interface DrayaClaims {
  /** User UUID */
  sub: string;
  /** Email address */
  email: string;
  /** User role: teacher | student | parent */
  role: 'teacher' | 'student' | 'parent';
  /** Display name */
  name?: string;
  /** Token issued-at (Unix seconds) */
  iat: number;
  /** Token expiry (Unix seconds) */
  exp: number;
}

/**
 * Decodes a JWT string and returns typed Draya claims.
 * Returns null if the token is invalid or cannot be decoded.
 */
export function decodeToken(token: string): DrayaClaims | null {
  try {
    return jwtDecode<DrayaClaims>(token);
  } catch {
    return null;
  }
}

/** Returns true if the token has not yet expired (compares exp to current time). */
export function isTokenExpired(token: string): boolean {
  const claims = decodeToken(token);
  if (!claims) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return claims.exp < nowSeconds;
}
