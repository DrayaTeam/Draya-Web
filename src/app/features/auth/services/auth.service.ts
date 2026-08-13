import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, finalize, Observable, throwError, tap } from 'rxjs';
import { AUTH_API } from './auth-api.token';
import { User, UserProfile, UserRole } from '../../../core/models/user.model';
import { ApiError } from '../../../core/models/api-error.model';
import { LoginRequest, RegisterTeacherRequest, RegisterStudentRequest, AuthResponse } from '../../../core/models/auth.model';
import { AuthService as CoreAuthService } from '../../../core/auth/auth.service';
import { isTokenExpired } from '../../../core/auth/jwt.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AUTH_API);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly coreAuth = inject(CoreAuthService);
  
  // State
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _authError = signal<ApiError | null>(null);

  // Expose read-only signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly authError = this._authError.asReadonly();

  // Computed
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('draya_access_token');
      if (storedToken && isTokenExpired(storedToken)) {
        // NOTE: This duplicates expiration-check timing with core/auth/auth.service.ts because
        // the two AuthService singletons aren't merged. Both now share the same isTokenExpired()
        // utility so they can't desync, but a future cleanup should merge these into one service.
        this.clearStorage();
        return;
      }

      const storedUser = localStorage.getItem('draya_user');
      if (storedUser) {
        try {
          this._currentUser.set(JSON.parse(storedUser));
        } catch {
          this.clearStorage();
        }
      }
    }
  }

  private handleAuthSuccess(response: AuthResponse): void {
    if (response.user && response.user.role) {
      response.user.role = response.user.role.toLowerCase() as UserRole;
    }
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('draya_access_token', response.accessToken);
      localStorage.setItem('draya_refresh_token', response.refreshToken);
      localStorage.setItem('draya_user', JSON.stringify(response.user));
    }
    this._currentUser.set(response.user);
    this._authError.set(null);
    this.coreAuth.loadTokens();
  }

  private clearStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('draya_access_token');
      localStorage.removeItem('draya_refresh_token');
      localStorage.removeItem('draya_user');
    }
    this._currentUser.set(null);
    this.coreAuth.loadTokens();
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._authError.set(null);
    return this.authApi.login(payload).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      catchError((error: ApiError) => {
        this._authError.set(error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading.set(false))
    );
  }

  registerTeacher(payload: RegisterTeacherRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._authError.set(null);
    return this.authApi.registerTeacher(payload).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      catchError((error: ApiError) => {
        this._authError.set(error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading.set(false))
    );
  }

  registerStudent(payload: RegisterStudentRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._authError.set(null);
    return this.authApi.registerStudent(payload).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      catchError((error: ApiError) => {
        this._authError.set(error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading.set(false))
    );
  }

  logout(): Observable<void> {
    this._isLoading.set(true);
    this._authError.set(null);
    // Clear local tokens immediately — do NOT wait for the server response.
    // Recon confirmed the access token is not server-side blacklisted, so the
    // real security boundary is removing it from storage at once. The server call
    // revokes the refresh token; its success/failure doesn't affect local cleanup.
    this.clearStorage();
    return this.authApi.logout().pipe(
      catchError((error: ApiError) => {
        // Local storage already cleared above — this is just propagating the error
        // for any caller that wants to show a notification.
        return throwError(() => error);
      }),
      finalize(() => this._isLoading.set(false))
    );
  }

  refreshToken(token: string): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._authError.set(null);
    return this.authApi.refreshToken(token).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      catchError((error: ApiError) => {
        this._authError.set(error);
        this.clearStorage();
        return throwError(() => error);
      }),
      finalize(() => this._isLoading.set(false))
    );
  }

  getProfile(): Observable<UserProfile> {
    this._isLoading.set(true);
    this._authError.set(null);
    return this.authApi.getProfile().pipe(
      tap((user) => {
        // The /auth/me endpoint may omit some fields (like 'role' for students).
        // Merge with existing currentUser (from login payload) to preserve them.
        const current = this._currentUser() || {};
        const mergedUser = { ...current, ...user } as UserProfile;

        if (mergedUser.role) {
          mergedUser.role = mergedUser.role.toLowerCase() as UserRole;
        }
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('draya_user', JSON.stringify(mergedUser));
        }
        this._currentUser.set(mergedUser);
      }),
      catchError((error: ApiError) => {
        this._authError.set(error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading.set(false))
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    this._isLoading.set(true);
    this._authError.set(null);
    return this.authApi.forgotPassword(email).pipe(
      catchError((error: ApiError) => {
        this._authError.set(error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading.set(false))
    );
  }

  resetPassword(payload: { token: string; newPassword: string }): Observable<void> {
    this._isLoading.set(true);
    this._authError.set(null);
    return this.authApi.resetPassword(payload).pipe(
      catchError((error: ApiError) => {
        this._authError.set(error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading.set(false))
    );
  }
}
