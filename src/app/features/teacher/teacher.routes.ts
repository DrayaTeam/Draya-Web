// src/app/features/teacher/teacher.routes.ts
// Purpose: Lazy-loaded routes for the teacher feature area.
// Protected by authGuard + roleGuard (role: teacher).

import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';

export const teacherRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/teacher-dashboard.component').then(
        (m) => m.TeacherDashboardComponent,
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['teacher'] },
    title: 'Dashboard — Draya',
  },
  {
    path: 'exam-builder',
    loadComponent: () =>
      import('./exam-builder/exam-builder.component').then(
        (m) => m.ExamBuilderComponent,
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['teacher'] },
    title: 'Exam Builder — Draya',
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
