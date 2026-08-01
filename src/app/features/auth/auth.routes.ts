import { Routes } from '@angular/router';
import { AuthShellComponent } from './layout/auth-shell/auth-shell.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthShellComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
        title: 'Sign In — Draya',
      },
      {
        path: 'register-teacher',
        loadComponent: () => import('./pages/register-teacher/register-teacher.component').then((m) => m.RegisterTeacherComponent),
        title: 'Register Teacher — Draya',
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      }
    ]
  }
];
