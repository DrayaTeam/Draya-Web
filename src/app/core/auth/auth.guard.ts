// src/app/core/auth/auth.guard.ts
// Purpose: Base route guard — ensures the user is authenticated before activating a route.
// If not logged in, redirects to /auth/login and preserves the attempted URL as a query param
// so the user can be redirected back after login.
// Used on all protected route segments in app.routes.ts.

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  // Redirect to login, preserving the attempted URL for post-login redirect.
  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};
