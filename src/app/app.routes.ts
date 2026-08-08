// src/app/app.routes.ts
// Purpose: Top-level application routes. All feature areas are lazy-loaded.
// Landing page and auth pages are public. Authenticated shell wraps teacher/student/parent.

import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const appRoutes: Routes = [
  // Public landing page
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
    pathMatch: 'full',
    title: 'درايَة — منصة التعلم الأكاديمي الذكي',
  },

  // Unauthenticated: auth feature (login, register, forgot-password)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },

  // Public: Plans & Pricing
  {
    path: 'plans',
    loadComponent: () => import('./features/plans/plans.component').then((m) => m.PlansComponent),
    title: 'خطط الأسعار والاشتراكات — درايَة',
  },
  {
    path: 'pricing',
    redirectTo: 'plans',
    pathMatch: 'full',
  },

  // Checkout / Subscription
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
    title: 'إتمام الاشتراك — درايَة',
  },

  // Authenticated shell — protected routes render inside ShellComponent
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'teacher',
        loadChildren: () =>
          import('./features/teacher/teacher.routes').then((m) => m.teacherRoutes),
      },
      {
        path: 'student',
        loadChildren: () =>
          import('./features/student/student.routes').then((m) => m.studentRoutes),
      },
      {
        path: 'parent',
        loadChildren: () => import('./features/parent/parent.routes').then((m) => m.parentRoutes),
      },
    ],
  },

  // Global error fallback
  {
    path: 'error',
    loadComponent: () =>
      import('./shared/components/global-error-fallback/global-error-fallback.component').then(
        (m) => m.GlobalErrorFallbackComponent,
      ),
    title: 'حدث خطأ — درايَة',
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: '',
  },
];
