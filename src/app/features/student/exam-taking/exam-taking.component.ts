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
  templateUrl: './exam-taking.component.html',
})
export class ExamTakingComponent {}
