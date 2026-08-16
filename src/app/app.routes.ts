// src/app/app.routes.ts
// Purpose: Top-level application routes. All feature areas are lazy-loaded.
// The shell (authenticated layout) wraps teacher/student/parent routes.
// The auth route is unprotected — login is accessible without authentication.

import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const appRoutes: Routes = [
  // Public Landing Page (Root)
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
    pathMatch: 'full',
  },

  // Unauthenticated: authentication feature (login page)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },

  // Authenticated routes — protected by authGuard & roleGuard, using each feature area's dedicated layout
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'teacher',
        canActivate: [roleGuard],
        data: { roles: ['teacher', 'admin'] },
        loadChildren: () =>
          import('./features/teacher/teacher.routes').then((m) => m.teacherRoutes),
      },
      {
        path: 'student',
        canActivate: [roleGuard],
        data: { roles: ['student'] },
        loadChildren: () =>
          import('./features/student/student.routes').then((m) => m.studentRoutes),
      },
      {
        path: 'parent',
        canActivate: [roleGuard],
        data: { roles: ['parent'] },
        loadChildren: () => import('./features/parent/parent.routes').then((m) => m.parentRoutes),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/auth/pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
  // Payment Callbacks & Verification
  {
    path: 'payment/result',
    loadComponent: () =>
      import(
        './features/student/checkout/payment-callback/student-payment-callback.component'
      ).then((m) => m.StudentPaymentCallbackComponent),
  },
  {
    path: 'payment/callback',
    redirectTo: 'payment/result',
  },
  {
    path: 'payments/callback',
    redirectTo: 'payment/result',
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./shared/components/global-error-fallback/global-error-fallback.component').then(
        (m) => m.GlobalErrorFallbackComponent,
      ),
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: '',
  },
];
