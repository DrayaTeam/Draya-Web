// src/app/core/auth/jwt.util.ts
// Purpose: Wraps jwt-decode to parse Draya JWT access tokens into a typed claims interface.
// The real Draya API uses:
//   - "sub" for userId
//   - "email" for email
//   - "http://schemas.microsoft.com/ws/2008/06/identity/claims/role" for the role (Microsoft claim)
//   - "fullName" for display name (NOT "name")
// Verified by decoding a real token from the deployed API (see docs/api-recon-findings.md).

import { jwtDecode } from 'jwt-decode';
import { UserRole } from '../models/user.model';

/** Raw claims as they exist in the JWT token from the Draya backend. */
interface RawDrayaClaims {
  sub: string;
  email: string;
  /** Microsoft identity role claim — full namespace key */
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string;
  /** Display name claim used by Draya backend (NOT the standard "name" claim) */
  fullName: string;
  jti: string;
  iat: number;
  exp: number;
}

/** Typed, normalized claims extracted from a Draya JWT access token. */
export interface DrayaClaims {
  /** User UUID */
  sub: string;
  /** Email address */
  email: string;
  /** Normalized lowercase role: 'teacher' | 'student' | 'admin' */
  role: UserRole;
  /** Display name */
  fullName: string;
  /** Token issued-at (Unix seconds) */
  iat: number;
  /** Token expiry (Unix seconds) */
  exp: number;
}

/**
 * Normalizes a PascalCase role string from the API ("Teacher", "Student")
 * to the lowercase format used throughout the frontend.
 */
export function normalizeRole(rawRole: string): UserRole {
  return rawRole.toLowerCase() as UserRole;
}

/**
 * Decodes a JWT string and returns typed, normalized Draya claims.
 * Returns null if the token is invalid or cannot be decoded.
 */
export function decodeToken(token: string): DrayaClaims | null {
  try {
    const raw = jwtDecode<RawDrayaClaims>(token);
    return {
      sub: raw.sub,
      email: raw.email,
      role: normalizeRole(raw['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']),
      fullName: raw.fullName,
      iat: raw.iat,
      exp: raw.exp,
    };
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
