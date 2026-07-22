// src/app/app.routes.ts
// Purpose: Top-level application routes. All feature areas are lazy-loaded.
// The shell (authenticated layout) wraps teacher/student/parent routes.
// The auth route is unprotected — login is accessible without authentication.

import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const appRoutes: Routes = [
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
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full',
      },
    ],
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
