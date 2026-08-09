// src/app/features/teacher/teacher.routes.ts
// Purpose: Lazy-loaded routes for the teacher feature area.
// Currently restricted to subscription management per requirements.

import { Routes } from '@angular/router';

export const teacherRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./teacher-layout.component').then((m) => m.TeacherLayoutComponent),
    children: [
      {
        path: 'subscription',
        loadComponent: () =>
          import('./subscription/subscription-page.component').then(
            (m) => m.SubscriptionPageComponent,
          ),
        title: 'الاشتراك والعدادات — درايَة',
      },
      {
        path: '',
        redirectTo: 'subscription',
        pathMatch: 'full',
      },
    ],
  },
];
