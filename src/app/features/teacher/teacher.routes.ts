// src/app/features/teacher/teacher.routes.ts
// Purpose: Lazy-loaded routes for the teacher feature area.

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
        path: 'packages',
        loadComponent: () =>
          import('./placeholder/teacher-placeholder.component').then(
            (m) => m.TeacherPlaceholderComponent,
          ),
        title: 'باقات الكورسات — درايَة',
      },
      {
        path: 'classrooms',
        loadComponent: () =>
          import('./placeholder/teacher-placeholder.component').then(
            (m) => m.TeacherPlaceholderComponent,
          ),
        title: 'إدارة الفصول — درايَة',
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./placeholder/teacher-placeholder.component').then(
            (m) => m.TeacherPlaceholderComponent,
          ),
        title: 'شؤون الطلاب — درايَة',
      },
      {
        path: 'exams',
        loadComponent: () =>
          import('./placeholder/teacher-placeholder.component').then(
            (m) => m.TeacherPlaceholderComponent,
          ),
        title: 'بنك الامتحانات — درايَة',
      },
      {
        path: 'channel',
        loadComponent: () =>
          import('./placeholder/teacher-placeholder.component').then(
            (m) => m.TeacherPlaceholderComponent,
          ),
        title: 'قناة الإعلانات — درايَة',
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./placeholder/teacher-placeholder.component').then(
            (m) => m.TeacherPlaceholderComponent,
          ),
        title: 'آراء وملاحظات — درايَة',
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./placeholder/teacher-placeholder.component').then(
            (m) => m.TeacherPlaceholderComponent,
          ),
        title: 'التحليلات — درايَة',
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./placeholder/teacher-placeholder.component').then(
            (m) => m.TeacherPlaceholderComponent,
          ),
        title: 'التقارير — درايَة',
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
        path: 'account',
        loadComponent: () =>
          import('./profile/teacher-profile.component').then(
            (m) => m.TeacherProfileComponent,
          ),
        title: 'الملف الشخصي — درايَة',
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
