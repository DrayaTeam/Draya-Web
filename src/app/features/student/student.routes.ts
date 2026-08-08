// src/app/features/student/student.routes.ts
// Purpose: Lazy-loaded routes for the student feature area.

import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';

export const studentRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/student-dashboard.component').then((m) => m.StudentDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['student'] },
    title: 'Dashboard — Draya',
  },
  {
    path: 'exam/:id',
    loadComponent: () =>
      import('./exam-taking/exam-taking.component').then((m) => m.ExamTakingComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['student'] },
    title: 'Exam — Draya',
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
