import { HttpInterceptorFn, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const messageService = inject(MessageService);
  const translate = inject(TranslateService);

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

      if (err.status === HttpStatusCode.UnprocessableEntity) {
        // Quota Limit Exceeded (422)
        const summary = translate.instant('SUBSCRIPTION.ERRORS.QUOTA_EXCEEDED_TITLE');
        const detail =
          err.error?.message ??
          err.error?.detail ??
          translate.instant('SUBSCRIPTION.ERRORS.QUOTA_EXCEEDED_DESC');

        messageService.add({
          severity: 'warn',
          summary,
          detail,
          life: 6000,
        });
      } else if (err.status === HttpStatusCode.Forbidden) {
        messageService.add({
          severity: 'error',
          summary: translate.instant('COMMON.FORBIDDEN_TITLE') || 'غير مسموح',
          detail:
            translate.instant('COMMON.FORBIDDEN_DESC') ||
            'ليس لديك الصلاحية للوصول إلى هذا المورد.',
        });
      } else if (err.status >= 500) {
        messageService.add({
          severity: 'error',
          summary: translate.instant('COMMON.SERVER_ERROR_TITLE') || 'خطأ في الخادم',
          detail:
            translate.instant('COMMON.SERVER_ERROR_DESC') ||
            'حدث خطأ في الخادم الداخلي، يرجى المحاولة لاحقًا.',
        });
      }

      const drayaError = {
        status: err.status,
        code: err.error?.code,
        message: err.error?.message ?? err.message ?? 'An unexpected error occurred.',
        detail: err.error?.detail,
      };

      return throwError(() => drayaError);
    }),
  );
};
