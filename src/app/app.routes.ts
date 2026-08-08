// src/app/app.routes.ts
// Purpose: Top-level application routes. All feature areas are lazy-loaded.
// Landing page and auth pages are public. Authenticated shell wraps teacher/student/parent.

import { Routes } from '@angular/router';

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
    loadChildren: () => import('./features/plans/plans.routes').then((m) => m.plansRoutes),
  },
  {
    path: 'pricing',
    redirectTo: 'plans',
    pathMatch: 'full',
  },

  // Checkout / Subscription
  // TODO: Add canActivate: [authGuard] here to require login before checkout.
  // Example: canActivate: [authGuard]
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
    title: 'إتمام الاشتراك — درايَة',
  },

  // Teacher Portal Layout (Uses TeacherLayoutComponent with standalone TeacherHeader Navbar)
  {
    path: 'teacher',
    loadChildren: () => import('./features/teacher/teacher.routes').then((m) => m.teacherRoutes),
  },

  // Shell — authenticated portal layout for student & parent
  // TODO: Add authGuard to protect all child routes.
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'student',
        // TODO: Add roleGuard for student role: canActivate: [roleGuard('STUDENT')]
        loadChildren: () =>
          import('./features/student/student.routes').then((m) => m.studentRoutes),
      },
      {
        path: 'parent',
        // TODO: Add roleGuard for parent role: canActivate: [roleGuard('PARENT')]
        loadChildren: () => import('./features/parent/parent.routes').then((m) => m.parentRoutes),
      },
    ],
  },

  // Global Error fallback route
  {
    path: 'error',
    loadComponent: () =>
      import('./shared/components/global-error-fallback/global-error-fallback.component').then(
        (m) => m.GlobalErrorFallbackComponent,
      ),
    title: 'حدث خطأ — درايَة',
  },

  // Fallback: unmatched routes redirect to landing page
  {
    path: '**',
    redirectTo: '',
  },
];
