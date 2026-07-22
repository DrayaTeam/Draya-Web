// src/app/layout/layout.routes.ts
// Purpose: Routes for the authenticated shell layout.
// The shell wraps all protected feature routes under a single router-outlet.
// Auth and role guards are applied here so every child route is protected.

import { Routes } from '@angular/router';
import { authGuard } from '../core/auth/auth.guard';

export const layoutRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      // Feature routes are lazy-loaded and registered in app.routes.ts as children.
      // This file is the layout host — see app.routes.ts for feature route wiring.
    ],
  },
];
