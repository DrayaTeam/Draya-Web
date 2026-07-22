// src/app/features/teacher/dashboard/teacher-dashboard.component.ts
// Purpose: Teacher dashboard placeholder. Will eventually host:
// - ng-apexcharts widgets (class performance, exam score distribution, completion rates)
// - Quick-access cards to Exam Builder and active student sessions
// - Real-time Q&A activity feed via SignalRService

import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="space-y-6 p-6">
      <h1 class="text-2xl font-bold text-foreground">
        {{ 'nav.dashboard' | translate }}
      </h1>
      <p class="text-muted-foreground">
        Teacher dashboard — analytics widgets coming soon.
      </p>
    </div>
  `,
})
export class TeacherDashboardComponent {}
