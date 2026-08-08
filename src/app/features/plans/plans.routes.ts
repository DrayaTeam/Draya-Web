// src/app/features/plans/plans.routes.ts
import { Routes } from '@angular/router';

export const plansRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./plans.component').then((m) => m.PlansComponent),
    title: 'خطط الأسعار والاشتراكات — درايَة',
  },
  {
    path: ':planId',
    loadComponent: () =>
      import('./plan-detail/plan-detail.component').then((m) => m.PlanDetailComponent),
    title: 'تفاصيل الخطة — درايَة',
  },
];
