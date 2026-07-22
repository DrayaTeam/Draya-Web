// src/app/features/student/exam-taking/exam-taking.component.ts
// Purpose: Exam-taking interface placeholder. Will eventually host:
// - Timer, question navigation, and answer submission form
// - Auto-save answers to the backend at regular intervals
// - Post-submission feedback from the Draya Grader agent
// - Real-time Q&A with the teacher via SignalR during the exam

import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-exam-taking',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="space-y-6 p-6">
      <h1 class="text-2xl font-bold text-foreground">
        {{ 'nav.exams' | translate }}
      </h1>
      <p class="text-muted-foreground">
        Exam-taking interface — timed exam flow coming soon.
      </p>
    </div>
  `,
})
export class ExamTakingComponent {}
