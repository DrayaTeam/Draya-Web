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
          import('./dashboard/student-dashboard.component').then(
            (m) => m.StudentDashboardComponent,
          ),
        title: 'الرئيسية — درايَة',
      },
      {
        path: 'teachers',
        loadComponent: () =>
          import('./teachers/teachers-directory.component').then(
            (m) => m.TeachersDirectoryComponent,
          ),
        title: 'تصفح المعلمين — درايَة',
      },
      {
        path: 'teachers/:id',
        loadComponent: () =>
          import('./teachers/teacher-details/teacher-details.component').then(
            (m) => m.TeacherDetailsComponent,
          ),
        title: 'ملف المعلم والباقات — درايَة',
      },
      {
        path: 'packages/:id',
        loadComponent: () =>
          import('./packages/package-details/package-details.component').then(
            (m) => m.PackageDetailsComponent,
          ),
        title: 'تفاصيل الباقة والمحتوى — درايَة',
      },
      {
        path: 'checkout/callback',
        loadComponent: () =>
          import('./checkout/payment-callback/student-payment-callback.component').then(
            (m) => m.StudentPaymentCallbackComponent,
          ),
        title: 'تأكيد الدفع والاشتراك — درايَة',
      },
      {
        path: 'checkout/:id',
        loadComponent: () =>
          import('./checkout/checkout.component').then((m) => m.CheckoutComponent),
        title: 'إتمام الاشتراك والدفع — درايَة',
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./courses/student-courses.component').then((m) => m.StudentCoursesComponent),
        title: 'باقاتي الدراسية — درايَة',
      },
      {
        path: 'exams',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./exams/student-exams.component').then((m) => m.StudentExamsComponent),
            title: 'الامتحانات والواجبات — درايَة',
          },
          {
            path: 'take',
            loadComponent: () =>
              import('./exams/active/student-active-exam.component').then(
                (m) => m.StudentActiveExamComponent,
              ),
            title: 'أداء الامتحان — درايَة',
          },
          {
            path: ':id/take',
            loadComponent: () =>
              import('./exams/active/student-active-exam.component').then(
                (m) => m.StudentActiveExamComponent,
              ),
            title: 'أداء الامتحان — درايَة',
          },
          {
            path: ':id/result',
            loadComponent: () =>
              import('./exams/result/student-exam-result.component').then(
                (m) => m.StudentExamResultComponent,
              ),
            title: 'نتيجة الامتحان والتحليل — درايَة',
          },
        ],
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./reports/student-reports.component').then((m) => m.StudentReportsComponent),
        title: 'تقاريري ودرجاتي — درايَة',
      },
      {
        path: 'library',
        loadComponent: () =>
          import('./library/student-library.component').then((m) => m.StudentLibraryComponent),
        title: 'المكتبة — درايَة',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/student-profile.component').then((m) => m.StudentProfileComponent),
        title: 'الملف الشخصي — درايَة',
      },
      {
        path: 'channel',
        loadComponent: () =>
          import('./channel/student-channel.component').then((m) => m.StudentChannelComponent),
        title: 'قناة الأسئلة والنقاش — درايَة',
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
