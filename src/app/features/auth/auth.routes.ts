import { Routes } from '@angular/router';
import { noAuthGuard } from '../../core/auth/auth.guard';

export const authRoutes: Routes = [
  {
    path: '',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./layout/auth-shell/auth-shell.component').then((m) => m.AuthShellComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
        title: 'Sign In — Draya',
      },
      {
        path: 'register-teacher',
        loadComponent: () =>
          import('./pages/register-teacher/register-teacher.component').then(
            (m) => m.RegisterTeacherComponent,
          ),
        title: 'Register Teacher — Draya',
      },
      {
        path: 'register-student',
        loadComponent: () =>
          import('./pages/register-student/register-student.component').then(
            (m) => m.RegisterStudentComponent,
          ),
        title: 'Register Student — Draya',
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
        title: 'Forgot Password — Draya',
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
        title: 'Reset Password — Draya',
      },
      {
        path: 'accept-invite',
        loadComponent: () =>
          import('./pages/accept-invite/accept-invite.component').then(
            (m) => m.AcceptInviteComponent,
          ),
        title: 'Accept Invitation — Draya',
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
