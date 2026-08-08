// src/app/features/auth/auth.routes.ts
// Purpose: Lazy-loaded routes for the authentication feature.

import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
    title: 'تسجيل الدخول — درايَة',
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then((m) => m.RegisterComponent),
    title: 'إنشاء حساب جديد — درايَة',
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    title: 'استعادة كلمة المرور — درايَة',
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
