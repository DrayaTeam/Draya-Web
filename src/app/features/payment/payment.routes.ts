// src/app/features/payment/payment.routes.ts
import { Routes } from '@angular/router';

export const paymentRoutes: Routes = [
  {
    path: 'callback',
    loadComponent: () => import('./pages/callback/payment-callback.component').then((m) => m.PaymentCallbackComponent),
    title: 'معالجة الدفع — دراية'
  },
  {
    path: '',
    redirectTo: 'callback',
    pathMatch: 'full'
  }
];
