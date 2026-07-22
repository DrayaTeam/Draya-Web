// src/app/features/student/dashboard/student-dashboard.component.ts
// Purpose: Student dashboard placeholder. Will eventually show:
// - Upcoming exams with countdown timers
// - Recent results and AI-generated feedback from the Grader agent
// - Q&A panel connected to the SignalR hub for real-time teacher interaction

import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="space-y-6 p-6">
      <h1 class="text-2xl font-bold text-foreground">
        {{ 'nav.dashboard' | translate }}
      </h1>
      <p class="text-muted-foreground">
        Student dashboard — upcoming exams and results coming soon.
      </p>
    </div>
  `,
})
export class StudentDashboardComponent {}
