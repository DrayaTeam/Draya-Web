import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
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

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
