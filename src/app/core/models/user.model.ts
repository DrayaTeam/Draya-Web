export type UserRole =
  'Teacher' | 'Student' | 'Admin' | 'SuperAdmin' | 'teacher' | 'student' | 'admin' | 'superadmin';

/**
 * Minimal user object returned by login / register / refresh responses.
 * NOTE: email is intentionally absent — the real API never includes it in
 * the auth response user object. Use UserProfile (from GET /auth/me) for email.
 */
export interface User {
  userId: string;
  email?: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: string;
  parentGuardianEmail?: string;
  profilePictureUrl?: string;
  pictureUrl?: string;
}

/**
 * Full user profile returned by GET /api/v1/auth/me.
 * Students: includes email, parentGuardianEmail, dateOfBirth.
 * Teachers: endpoint currently returns 404 — see AuthApiService.getProfile() fallback.
 */
export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  parentGuardianEmail?: string;
  dateOfBirth?: string;
  profilePictureUrl?: string;
  pictureUrl?: string;
}
