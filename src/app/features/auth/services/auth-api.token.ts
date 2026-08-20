import { InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  RegisterTeacherRequest,
  RegisterStudentRequest,
  LoginRequest,
  AuthResponse,
} from '../../../core/models/auth.model';
import { UserProfile } from '../../../core/models/user.model';
import { AuthApiService } from './auth-api.service';

export interface IAuthApi {
  registerTeacher(payload: RegisterTeacherRequest): Observable<AuthResponse>;
  registerStudent(payload: RegisterStudentRequest): Observable<AuthResponse>;
  login(payload: LoginRequest): Observable<AuthResponse>;
  refreshToken(refreshToken: string): Observable<AuthResponse>;
  logout(): Observable<void>;
  getProfile(): Observable<UserProfile>;

  forgotPassword(email: string): Observable<{ message: string }>;
  resetPassword(payload: { token: string; newPassword: string; email?: string }): Observable<void>;
  acceptInvite(payload: {
    email?: string;
    token: string;
    password?: string;
    newPassword?: string;
    confirmPassword?: string;
    fullName?: string;
    phone?: string;
  }): Observable<void>;
  changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<void>;
}

export const AUTH_API = new InjectionToken<IAuthApi>('AUTH_API', {
  providedIn: 'root',
  factory: () => {
    return inject(AuthApiService);
  },
});
