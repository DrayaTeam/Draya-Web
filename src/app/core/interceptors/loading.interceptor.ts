import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const skipLoading = req.headers.has('X-Skip-Loading');
  const loadingService = inject(LoadingService);

  if (skipLoading) {
    return next(req);
  }

  loadingService.show();
  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};
