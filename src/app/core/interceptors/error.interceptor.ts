import { HttpInterceptorFn, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { MessageService } from 'primeng/api';
import { ApiError, ValidationError } from '../models/api-error.model';

/**
 * Maps PascalCase field names from the real Draya API to camelCase form-control names.
 * Real API returns: "Email", "Password", "FullName", "Phone", "ParentGuardianEmail",
 * "DateOfBirth", "NewPassword", "Token" — form controls use camelCase equivalents.
 */
const FIELD_NAME_MAP: Record<string, string> = {
  Email: 'email',
  Password: 'password',
  FullName: 'fullName',
  Phone: 'phone',
  ParentGuardianEmail: 'parentGuardianEmail',
  DateOfBirth: 'dateOfBirth',
  NewPassword: 'newPassword',
  Token: 'token',
};

function normalizeFieldName(pascalField: string): string {
  return FIELD_NAME_MAP[pascalField] ?? pascalField.charAt(0).toLowerCase() + pascalField.slice(1);
}

/**
 * Parses a raw HTTP error response into a typed ApiError.
 * Handles:
 *   - Real API wrapper: { error: { code, message, details[{ field, issue }] } }
 *   - Empty-body 401 (from logout, /auth/me with bad token — body is empty string or null)
 *   - Multiple details entries for the same field (aggregated into a single entry with combined issue text)
 */
function parseApiError(err: HttpErrorResponse): ApiError {
  const wrapper = err.error?.error;

  // Empty-body 401 (logout, /auth/me bad token, etc.)
  if (!wrapper || typeof wrapper !== 'object') {
    if (err.status === HttpStatusCode.Unauthorized) {
      return { code: 'SESSION_EXPIRED', message: 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.' };
    }
    return {
      code: `HTTP_${err.status}`,
      message: err.message ?? 'An unexpected error occurred.',
    };
  }

  // Normalize details: PascalCase→camelCase, aggregate multiple issues per field
  const rawDetails: { field: string; issue: string }[] = wrapper.details ?? [];
  const fieldIssues = new Map<string, string[]>();
  for (const d of rawDetails) {
    const camelField = normalizeFieldName(d.field ?? '');
    if (!fieldIssues.has(camelField)) {
      fieldIssues.set(camelField, []);
    }
    fieldIssues.get(camelField)!.push(d.issue ?? '');
  }

  const details: ValidationError[] = [];
  fieldIssues.forEach((issues, field) => {
    details.push({ field, issue: issues.join(' ') });
  });

  return {
    code: wrapper.code ?? `HTTP_${err.status}`,
    message: wrapper.message ?? err.message ?? 'An unexpected error occurred.',
    details: details.length > 0 ? details : undefined,
  };
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Avoid intercepting auth requests or infinite loops
      const isAuthRequest = req.url.includes('/auth/refresh') || req.url.includes('/auth/login');

      if (err.status === HttpStatusCode.Unauthorized && !isAuthRequest) {
        return auth.refresh().pipe(
          switchMap((res) => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` },
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            auth.logout();
            return throwError(() => parseApiError(refreshErr instanceof HttpErrorResponse ? refreshErr : err));
          })
        );
      }

      if (err.status === HttpStatusCode.Forbidden) {
        messageService.add({
          severity: 'error',
          summary: 'غير مسموح',
          detail: 'ليس لديك الصلاحية للوصول إلى هذا المورد.',
        });
      } else if (err.status >= 500) {
        messageService.add({
          severity: 'error',
          summary: 'خطأ في الخادم',
          detail: 'حدث خطأ في الخادم الداخلي، يرجى المحاولة لاحقًا.',
        });
      }

      return throwError(() => parseApiError(err));
    })
  );
};
