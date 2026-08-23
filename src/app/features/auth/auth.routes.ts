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
        path: 'register',
        redirectTo: 'register-teacher',
        pathMatch: 'full',
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
        // Superseded by the two-step OTP flow at 'forgot-password': the
        // backend now emails a 6-digit code, not a ?token= reset link, so
        // this query-param-driven page has nothing left to consume. Kept as
        // a redirect (not deleted outright) in case a stale bookmark or an
        // old pre-redesign email link still points here.
        path: 'reset-password',
        redirectTo: 'forgot-password',
        pathMatch: 'full',
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
