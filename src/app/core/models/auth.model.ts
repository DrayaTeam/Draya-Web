import { User, UserProfile } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterTeacherRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface RegisterStudentRequest {
  email: string;
  password: string;
  fullName: string;
  parentGuardianEmail: string;
  dateOfBirth: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// Re-export UserProfile so callers can import from auth.model as before
export type { UserProfile };
