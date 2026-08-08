import { InjectionToken, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RegisterTeacherRequest, RegisterStudentRequest, LoginRequest, AuthResponse, UserProfile } from '../../../core/models/auth.model';
import { environment } from '../../../../environments/environment';
import { AuthApiService } from './auth-api.service';
import { AuthMockApiService } from './auth-mock-api.service';

export interface IAuthApi {
  registerTeacher(payload: RegisterTeacherRequest): Observable<AuthResponse>;
  registerStudent(payload: RegisterStudentRequest): Observable<AuthResponse>;
  login(payload: LoginRequest): Observable<AuthResponse>;
  refreshToken(refreshToken: string): Observable<AuthResponse>;
  logout(): Observable<void>;
  getProfile(): Observable<UserProfile>;

  forgotPassword(email: string): Observable<{ message: string }>;
  resetPassword(payload: { token: string; newPassword: string }): Observable<{ message: string }>;
}

export const AUTH_API = new InjectionToken<IAuthApi>('AUTH_API', {
  providedIn: 'root',
  factory: () => {
    return environment.useMockAuthApi ? inject(AuthMockApiService) : inject(AuthApiService);
  }
});
