// src/app/features/parent/parent.routes.ts
// Purpose: Lazy-loaded routes for the parent feature area.

import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';

export const parentRoutes: Routes = [
  {
    path: 'reports',
    loadComponent: () =>
      import('./reports/parent-reports.component').then((m) => m.ParentReportsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['parent'] },
    title: 'Reports — Draya',
  },
  {
    path: '',
    redirectTo: 'reports',
    pathMatch: 'full',
  },
];
