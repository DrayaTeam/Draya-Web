import { Injectable, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DrayaClaims, decodeToken, isTokenExpired } from './jwt.util';

const TOKEN_KEY = 'draya_access_token';
const REFRESH_KEY = 'draya_refresh_token';

import { LoginRequest, AuthResponse } from '../models/auth.model';

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
  private readonly platformId = inject(PLATFORM_ID);

  /** Raw JWT access token string, or null if not authenticated. */
  readonly accessToken = signal<string | null>(null);

  /** Decoded claims from the current access token, or null if not authenticated. */
  readonly currentUser = computed<AuthUser | null>(() => {
    const token = this.accessToken();
    if (!token) return null;
    const claims = decodeToken(token);
    if (!claims) return null;
    return {
      id: claims.sub,
      email: claims.email,
      name: claims.fullName,
      role: claims.role,
    };
  });

  /** True when there is a valid, non-expired access token. */
  readonly isLoggedIn = computed(() => {
    const token = this.accessToken();
    return !!token && !isTokenExpired(token);
  });

  constructor() {
    this.loadTokens();
  }

  /** Reloads tokens from storage to sync state if another service updated them. */
  loadTokens(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        if (isTokenExpired(stored)) {
          this.clearTokens();
        } else {
          this.accessToken.set(stored);
        }
      } else {
        this.clearTokens();
      }
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
    let refreshToken: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      refreshToken = localStorage.getItem(REFRESH_KEY);
    }
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, res.accessToken);
      localStorage.setItem(REFRESH_KEY, res.refreshToken);
    }
    this.accessToken.set(res.accessToken);
  }

  private clearTokens(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
    this.accessToken.set(null);
  }
}
