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
          import('./classrooms/teacher-classrooms.component').then(
            (m) => m.TeacherClassroomsComponent,
          ),
        title: 'إدارة الفصول — درايَة',
      },
      {
        path: 'classrooms/:id',
        loadComponent: () =>
          import('./classrooms/classroom-detail/classroom-detail.component').then(
            (m) => m.ClassroomDetailComponent,
          ),
        title: 'تفاصيل الفصل — درايَة',
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./students/teacher-students/teacher-students.component').then(
            (m) => m.TeacherStudentsComponent,
          ),
        title: 'سجل الطلبة | دراية',
      },
      {
        path: 'exams',
        loadComponent: () =>
          import('./exams/teacher-exams/teacher-exams.component').then(
            (m) => m.TeacherExamsComponent,
          ),
        title: 'إدارة الامتحانات | دراية',
      },
      {
        path: 'exams/generate',
        loadComponent: () =>
          import('./exams/generate-exam/generate-exam.component').then(
            (m) => m.GenerateExamComponent,
          ),
        title: 'إنشاء امتحان بالذكاء الاصطناعي — درايَة',
      },
      {
        path: 'exams/generations/:id/tracking',
        loadComponent: () =>
          import('./exams/generation-tracker/generation-tracker.component').then(
            (m) => m.GenerationTrackerComponent,
          ),
        title: 'جاري الإنشاء... — درايَة',
      },
      {
        path: 'exams/:id/review',
        loadComponent: () =>
          import('./exams/review-exam/review-exam.component').then(
            (m) => m.ReviewExamComponent,
          ),
        title: 'مراجعة الامتحان — درايَة',
      },
      {
        path: 'channel',
        loadComponent: () =>
          import('./channel/teacher-channel.component').then(
            (m) => m.TeacherChannelComponent,
          ),
        title: 'الأسئلة والنقاش',
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./feedback/teacher-feedback.component').then(
            (m) => m.TeacherFeedbackComponent,
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
        path: 'wallet',
        loadComponent: () =>
          import('./wallet/teacher-wallet.component').then((m) => m.TeacherWalletComponent),
        title: 'المحفظة المالية — درايَة',
      },
      {
        path: 'account',
        loadComponent: () =>
          import('./profile/teacher-profile.component').then((m) => m.TeacherProfileComponent),
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
