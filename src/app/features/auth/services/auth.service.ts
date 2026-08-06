import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, tap, finalize, Observable, throwError } from 'rxjs';
import { AUTH_API } from './auth-api.token';
import { User } from '../../../core/models/user.model';
import { ApiError } from '../../../core/models/api-error.model';
import { LoginRequest, RegisterTeacherRequest, RegisterStudentRequest, AuthResponse } from '../../../core/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AUTH_API);
  private readonly platformId = inject(PLATFORM_ID);
  
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('draya_access_token', response.accessToken);
      localStorage.setItem('draya_refresh_token', response.refreshToken);
      localStorage.setItem('draya_user', JSON.stringify(response.user));
    }
    this._currentUser.set(response.user);
    this._authError.set(null);
  }

  private clearStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('draya_access_token');
      localStorage.removeItem('draya_refresh_token');
      localStorage.removeItem('draya_user');
    }
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
    return this.authApi.logout().pipe(
      tap(() => this.clearStorage()),
      catchError((error: ApiError) => {
        this._authError.set(error);
        this.clearStorage();
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

  getProfile(): Observable<User> {
    this._isLoading.set(true);
    this._authError.set(null);
    return this.authApi.getProfile().pipe(
      tap((user) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('draya_user', JSON.stringify(user));
        }
        this._currentUser.set(user);
      }),
      catchError((error: ApiError) => {
        this._authError.set(error);
        return throwError(() => error);
      }),
      finalize(() => this._isLoading.set(false))
    );
  }

  // PROVISIONAL: contract not yet confirmed by backend — revisit endpoint shape once delivered
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

  resetPassword(payload: { token: string; newPassword: string }): Observable<{ message: string }> {
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
