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
  templateUrl: './teacher-dashboard.component.html',
})
export class TeacherDashboardComponent {}
