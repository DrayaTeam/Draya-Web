// src/app/core/auth/auth.service.ts
// Purpose: Signal-based authentication state management for the Draya platform.
// Handles login, logout, token refresh, and persists the JWT to localStorage.
// All consumers read auth state reactively via signals (currentUser, isLoggedIn, accessToken).

import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DrayaClaims, decodeToken, isTokenExpired } from './jwt.util';

const TOKEN_KEY = 'draya_access_token';
const REFRESH_KEY = 'draya_refresh_token';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: DrayaClaims['role'];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  /** Raw JWT access token string, or null if not authenticated. */
  readonly accessToken = signal<string | null>(
    localStorage.getItem(TOKEN_KEY),
  );

  /** Decoded claims from the current access token, or null if not authenticated. */
  readonly currentUser = computed<AuthUser | null>(() => {
    const token = this.accessToken();
    if (!token) return null;
    const claims = decodeToken(token);
    if (!claims) return null;
    return {
      id: claims.sub,
      email: claims.email,
      name: claims.name ?? claims.email,
      role: claims.role,
    };
  });

  /** True when there is a valid, non-expired access token. */
  readonly isLoggedIn = computed(() => {
    const token = this.accessToken();
    return !!token && !isTokenExpired(token);
  });

  constructor() {
    // On init, clear stale expired tokens so guards see a clean state.
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored && isTokenExpired(stored)) {
      this.clearTokens();
    }
  }

  /** Authenticates with the backend and persists tokens on success. */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, credentials)
      .pipe(tap((res) => this.storeTokens(res)));
  }

  /** Exchanges the stored refresh token for a new access token. */
  refresh(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/auth/refresh`, {
        refreshToken,
      })
      .pipe(tap((res) => this.storeTokens(res)));
  }

  /** Clears all auth state and redirects to the login page. */
  logout(): void {
    this.clearTokens();
    this.router.navigate(['/auth/login']);
  }

  private storeTokens(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    this.accessToken.set(res.accessToken);
  }

  private clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this.accessToken.set(null);
  }
}
