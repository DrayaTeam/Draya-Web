// src/app/features/auth/auth.routes.ts
// Purpose: Lazy-loaded routes for the authentication feature.

import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
    title: 'Sign In — Draya',
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
