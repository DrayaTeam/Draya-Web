// src/app/core/interceptors/error.interceptor.ts
// Purpose: Global HTTP error handler for the Draya API.
// Catches 401 (token expired), 403 (forbidden), and 5xx (server errors) responses.
// On 401: triggers auth logout so stale tokens are cleared and the user is redirected.
// On other errors: maps to a typed DrayaHttpError and re-throws so feature services can handle.

import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface DrayaHttpError {
  status: number;
  message: string;
  detail?: string;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === HttpStatusCode.Unauthorized) {
        // Token expired or invalid — clear session and redirect to login.
        auth.logout();
      }

      const drayaError: DrayaHttpError = {
        status: err.status,
        message:
          err.error?.message ??
          err.message ??
          'An unexpected error occurred.',
        detail: err.error?.detail,
      };

      return throwError(() => drayaError);
    }),
  );
};
