import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'withdrawals',
        loadComponent: () =>
          import('./pages/withdrawals/admin-withdrawals.component').then(
            (m) => m.AdminWithdrawalsComponent,
          ),
      },
      {
        path: 'adjustments',
        loadComponent: () =>
          import('./pages/adjustments/admin-adjustments.component').then(
            (m) => m.AdminAdjustmentsComponent,
          ),
      },
      {
        path: 'classroom-types',
        loadComponent: () =>
          import('./pages/classroom-types/admin-classroom-types.component').then(
            (m) => m.AdminClassroomTypesComponent,
          ),
      },
      {
        path: 'grade-levels',
        loadComponent: () =>
          import('./pages/grade-levels/admin-grade-levels.component').then(
            (m) => m.AdminGradeLevelsComponent,
          ),
      },
      {
        path: 'supervisors',
        loadComponent: () =>
          import('./pages/supervisors/admin-supervisors.component').then(
            (m) => m.AdminSupervisorsComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/admin-settings.component').then((m) => m.AdminSettingsComponent),
      },
    ],
  },
];
