import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();

  if (user && (user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'superadmin')) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};
