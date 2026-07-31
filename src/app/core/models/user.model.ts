export type UserRole = 'teacher' | 'student' | 'admin';

export interface User {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  dateOfBirth?: string;
  parentGuardianEmail?: string;
}
