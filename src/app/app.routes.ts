// src/app/app.routes.ts
// Purpose: Top-level application routes. All feature areas are lazy-loaded.
// The shell (authenticated layout) wraps teacher/student/parent routes.
// The auth route is unprotected — login is accessible without authentication.

import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

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
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },

  // Authenticated shell — all protected routes render inside ShellComponent
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'teacher',
        loadChildren: () =>
          import('./features/teacher/teacher.routes').then(
            (m) => m.teacherRoutes,
          ),
      },
      {
        path: 'student',
        loadChildren: () =>
          import('./features/student/student.routes').then(
            (m) => m.studentRoutes,
          ),
      },
      {
        path: 'parent',
        loadChildren: () =>
          import('./features/parent/parent.routes').then((m) => m.parentRoutes),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/auth/pages/profile/profile.component').then((m) => m.ProfileComponent),
      }
    ],
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./shared/components/global-error-fallback/global-error-fallback.component').then(
        (m) => m.GlobalErrorFallbackComponent
      ),
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: '',
  },
];
