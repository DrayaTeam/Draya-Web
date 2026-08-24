import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, finalize, Observable, throwError, tap, map, of, shareReplay } from 'rxjs';
import { AUTH_API } from './auth-api.token';
import { User, UserProfile, UserRole } from '../../../core/models/user.model';
import { ApiError } from '../../../core/models/api-error.model';
import {
  LoginRequest,
  RegisterTeacherRequest,
  RegisterStudentRequest,
  AuthResponse,
} from '../../../core/models/auth.model';
import { isTokenExpired } from '../../../core/auth/jwt.util';

import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AUTH_API);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  // State
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _authError = signal<ApiError | null>(null);
  private readonly _accessToken = signal<string | null>(null);

  // Expose read-only signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly authError = this._authError.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();

  // Computed
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('draya_access_token');
      if (storedToken && isTokenExpired(storedToken)) {
        this.clearStorage();
        return;
      }
      if (storedToken) {
        this._accessToken.set(storedToken);
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
    this._accessToken.set(response.accessToken);
    this._currentUser.set(response.user);
    this._authError.set(null);
  }

  private clearStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('draya_access_token');
      localStorage.removeItem('draya_refresh_token');
      localStorage.removeItem('draya_user');
    }
    this._accessToken.set(null);
    this._currentUser.set(null);
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
      finalize(() => this._isLoading.set(false)),
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
      finalize(() => this._isLoading.set(false)),
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
      finalize(() => this._isLoading.set(false)),
    );
  }

  logout(): void {
    this._isLoading.set(true);
    this._authError.set(null);

    // Call backend revocation while token is still in localStorage
    this.authApi
      .logout()
      .pipe(
        finalize(() => {
          this.clearStorage();
          this._isLoading.set(false);
          this.router.navigate(['/auth/login']);
        }),
      )
      .subscribe({
        next: () => void 0,
        error: () => void 0,
      });
  }

  refreshToken(token: string): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._authError.set(null);
    return this.authApi.refreshToken(token).pipe(
      tap((res) => {
        // A 200 with a missing accessToken/refreshToken (e.g. an empty body)
        // must not be treated as success — writing "undefined" into storage
        // would silently corrupt the session instead of failing loudly.
        if (!res?.accessToken || !res?.refreshToken) {
          throw new Error('Refresh-token response is missing accessToken/refreshToken.');
        }
        this.handleAuthSuccess(res);
      }),
      catchError((error: ApiError) => {
        this._authError.set(error);
        this.clearStorage();
        return throwError(() => error);
      }),
      finalize(() => this._isLoading.set(false)),
    );
  }

  private refreshInProgress$: Observable<AuthResponse> | null = null;

  /**
   * Refreshes the access token, sharing one in-flight HTTP call across every
   * concurrent caller instead of firing one refresh request per 401.
   *
   * Without this, a page that fires several API calls at once (e.g. loading
   * an exam) triggers one refresh-token call per failed request when the
   * access token has expired. If the backend rotates refresh tokens (issues
   * a new one and invalidates the old on each use — standard practice), only
   * the first of those parallel calls succeeds; every other one races against
   * an already-consumed refresh token, fails, and calls logout() — which
   * clears the fresh tokens the first call just stored and force-logs-out a
   * user whose session was actually fine. This is a likely cause of the
   * exam start intermittently failing with what looks like an unrelated
   * error, or the session appearing to silently end mid-flow.
   */
  refresh(): Observable<AuthResponse> {
    if (this.refreshInProgress$) {
      return this.refreshInProgress$;
    }

    const refreshToken = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('draya_refresh_token')
      : null;

    const request$ = this.refreshToken(refreshToken ?? '').pipe(
      shareReplay(1),
      finalize(() => {
        this.refreshInProgress$ = null;
      }),
    );
    this.refreshInProgress$ = request$;
    return request$;
  }

  updateLocalUser(partial: Partial<User>): void {
    const current = this._currentUser();
    if (current) {
      const updated = { ...current, ...partial };
      this._currentUser.set(updated);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('draya_user', JSON.stringify(updated));
      }
    }
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
      finalize(() => this._isLoading.set(false)),
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
      finalize(() => this._isLoading.set(false)),
    );
  }

  resetPassword(payload: { token: string; newPassword: string; email?: string }): Observable<void> {
    this._isLoading.set(true);
    this._authError.set(null);
    return this.authApi.resetPassword(payload).pipe(
      catchError((error: ApiError) => {
        this._authError.set(error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading.set(false)),
    );
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
    this._isLoading.set(true);
    this._authError.set(null);
    return this.authApi.acceptInvite(payload).pipe(
      catchError((error: ApiError) => {
        this._authError.set(error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading.set(false)),
    );
  }

  changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<{ success: boolean; message: string }> {
    this._isLoading.set(true);
    this._authError.set(null);
    return this.authApi.changePassword(payload).pipe(
      map(() => ({
        success: true,
        message: 'تم تغيير كلمة المرور بنجاح!',
      })),
      catchError(
        (error: {
          error?: { code?: string; message?: string; error?: { message?: string } };
          message?: string;
          status?: number;
        }) => {
          const errorMsg =
            error?.error?.error?.message ||
            error?.error?.message ||
            (error?.error?.code === 'INVALID_CURRENT_PASSWORD'
              ? 'كلمة المرور الحالية غير صحيحة.'
              : 'تعذر تغيير كلمة المرور. يرجى التأكد من مطابقة الشروط.');
          return of({
            success: false,
            message: errorMsg,
          });
        },
      ),
      finalize(() => this._isLoading.set(false)),
    );
  }
}
