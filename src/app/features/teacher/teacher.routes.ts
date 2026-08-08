// src/app/features/teacher/teacher.routes.ts
// Purpose: Lazy-loaded routes for the teacher feature area.
// TODO: Attach authGuard & roleGuard('TEACHER') to protect these routes in production.
// Example:
// import { authGuard } from '../../core/auth/auth.guard';
// import { roleGuard } from '../../core/auth/role.guard';
// canActivate: [authGuard, roleGuard('TEACHER')]

import { Routes } from '@angular/router';

export const teacherRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./teacher-layout.component').then((m) => m.TeacherLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/teacher-dashboard.component').then(
            (m) => m.TeacherDashboardComponent,
          ),
        title: 'لوحة التحكم — درايَة',
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./placeholder/teacher-placeholder.component').then(
            (m) => m.TeacherPlaceholderComponent,
          ),
        title: 'باقاتي الدراسية — درايَة',
      },
      {
        path: 'exams',
        loadComponent: () =>
          import('./placeholder/teacher-placeholder.component').then(
            (m) => m.TeacherPlaceholderComponent,
          ),
        title: 'الامتحانات والتصحيح — درايَة',
      },
      {
        path: 'exam-builder',
        loadComponent: () =>
          import('./exam-builder/exam-builder.component').then((m) => m.ExamBuilderComponent),
        title: 'منشئ الامتحانات الذكي — درايَة',
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./placeholder/teacher-placeholder.component').then(
            (m) => m.TeacherPlaceholderComponent,
          ),
        title: 'درجاتي وتقاريري — درايَة',
      },
      {
        path: 'library',
        loadComponent: () =>
          import('./placeholder/teacher-placeholder.component').then(
            (m) => m.TeacherPlaceholderComponent,
          ),
        title: 'المكتبة الشاملة — درايَة',
      },
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
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
