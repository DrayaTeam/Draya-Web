// src/app/core/auth/auth.interceptor.ts
// Purpose: HTTP interceptor that attaches the JWT Bearer token to every outgoing request.
// Skips the Authorization header for auth endpoints (login, refresh) to avoid circular headers.
// Registered in app.config.ts via withInterceptors([authInterceptor]).

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/** Paths that must NOT receive the Authorization header. */
const AUTH_BYPASS_PATHS = ['/auth/login', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();

  // Skip attaching the token for auth endpoints.
  const isBypass = AUTH_BYPASS_PATHS.some((path) => req.url.includes(path));

  if (!token || isBypass) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq);
};
