import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { IAuthApi } from './auth-api.token';
import {
  RegisterTeacherRequest,
  RegisterStudentRequest,
  LoginRequest,
  AuthResponse,
} from '../../../core/models/auth.model';
import { UserProfile } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';
import { decodeToken } from '../../../core/auth/jwt.util';

@Injectable({ providedIn: 'root' })
export class AuthApiService implements IAuthApi {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  registerTeacher(payload: RegisterTeacherRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register/teacher`, payload);
  }

  registerStudent(payload: RegisterStudentRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register/student`, payload);
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload);
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh-token`, { refreshToken });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }

  /**
   * Fetches the current user's full profile from the server.
   *
   * TEMPORARY WORKAROUND: GET /auth/me returns 404 "Active subscription not found" for Teacher
   * accounts due to a backend bug (reported — see docs/api-recon-findings.md § View Profile).
   * When that specific error occurs, we fall back to decoding the stored JWT access token, which
   * contains email, fullName, and role claims, to reconstruct a minimal UserProfile.
   * Remove this fallback once the backend team fixes the /auth/me endpoint for Teachers.
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me`).pipe(
      catchError((err) => {
        // TEMPORARY WORKAROUND (see JSDoc above)
        if (err?.code === 'NOT_FOUND' && err?.message === 'Active subscription not found.') {
          const token = isPlatformBrowser(this.platformId)
            ? localStorage.getItem('draya_access_token')
            : null;
          if (token) {
            const claims = decodeToken(token);
            if (claims) {
              const fallbackProfile: UserProfile = {
                userId: claims.sub,
                email: claims.email,
                fullName: claims.fullName,
                role: claims.role,
              };
              return of(fallbackProfile);
            }
          }
        }
        return throwError(() => err);
      }),
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/password-reset/request`, { email });
  }

  resetPassword(payload: { token: string; newPassword: string; email?: string }): Observable<void> {
    const body = {
      token: payload.token,
      newPassword: payload.newPassword,
    };
    return this.http.post<void>(`${this.baseUrl}/password-reset/confirm`, body);
  }

  acceptInvite(payload: {
    email?: string;
    token: string;
    password?: string;
    newPassword?: string;
    confirmPassword?: string;
    fullName?: string;
    phone?: string;
  }): Observable<void> {
    const body = {
      email: payload.email,
      token: payload.token,
      password: payload.password || payload.newPassword,
      confirmPassword: payload.confirmPassword || payload.password || payload.newPassword,
    };
    return this.http.post<void>(`${this.baseUrl}/accept-invite`, body);
  }

  changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/change-password`, payload);
  }
}
