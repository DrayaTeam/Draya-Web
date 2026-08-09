// src/app/features/student/student.routes.ts
// Purpose: Lazy-loaded routes for the student feature area.

import { Routes } from '@angular/router';

export const studentRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./student-layout.component').then((m) => m.StudentLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../teacher/dashboard/teacher-dashboard.component').then(
            (m) => m.TeacherDashboardComponent,
          ),
        title: 'الرئيسية — درايَة',
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./placeholder/student-placeholder.component').then(
            (m) => m.StudentPlaceholderComponent,
          ),
        title: 'كورساتي — درايَة',
      },
      {
        path: 'exams',
        loadComponent: () =>
          import('./placeholder/student-placeholder.component').then(
            (m) => m.StudentPlaceholderComponent,
          ),
        title: 'الامتحانات — درايَة',
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./placeholder/student-placeholder.component').then(
            (m) => m.StudentPlaceholderComponent,
          ),
        title: 'تقاريري ودرجاتي — درايَة',
      },
      {
        path: 'library',
        loadComponent: () =>
          import('./placeholder/student-placeholder.component').then(
            (m) => m.StudentPlaceholderComponent,
          ),
        title: 'المكتبة — درايَة',
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
