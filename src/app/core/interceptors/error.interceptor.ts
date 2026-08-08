import { HttpInterceptorFn, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { MessageService } from 'primeng/api';

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
            return throwError(() => refreshErr);
          }),
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

      const drayaError = {
        status: err.status,
        message: err.error?.message ?? err.message ?? 'An unexpected error occurred.',
        detail: err.error?.detail,
      };

      return throwError(() => drayaError);
    }),
  );
};
