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
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      }
    ]
  }
];
