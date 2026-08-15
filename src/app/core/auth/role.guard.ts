// src/app/core/auth/role.guard.ts
// Purpose: Role-based route guard for the Draya multi-role platform.
// Checks that the authenticated user's role matches one of the roles declared
// in the route's `data.roles` array. Redirects to the appropriate dashboard
// if the user is authenticated but unauthorized for this route.
// Usage in routes: { data: { roles: ['teacher'] }, canActivate: [authGuard, roleGuard] }

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser();
  if (!user) {
    // Not logged in at all — authGuard should have caught this, but be defensive.
    return router.createUrlTree(['/auth/login']);
  }

  const allowedRoles: string[] = route.data?.['roles'] ?? [];
  if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
    return true;
  }

  // Authenticated but wrong role — redirect to the user's own dashboard.
  const roleDashboards: Record<string, string> = {
    teacher: '/teacher/dashboard',
    student: '/student/dashboard',
    admin: '/teacher/dashboard',
    parent: '/parent/reports',
  };

  return router.createUrlTree([roleDashboards[user.role] ?? '/']);
};
