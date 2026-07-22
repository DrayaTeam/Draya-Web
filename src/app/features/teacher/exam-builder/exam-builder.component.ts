// src/app/features/teacher/exam-builder/exam-builder.component.ts
// Purpose: Exam Builder placeholder. Will eventually host:
// - ngx-formly schema-driven form for dynamic question creation
// - Integration with the Draya Exam Builder AI agent (generates questions from learning objectives)
// - The Grader agent hook for automated essay/short-answer evaluation
// - Preview and publish flow sending the exam schema to the ASP.NET Core backend

import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-exam-builder',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="space-y-6 p-6">
      <h1 class="text-2xl font-bold text-foreground">
        {{ 'nav.exams' | translate }}
      </h1>
      <p class="text-muted-foreground">
        Exam Builder — AI-powered question creation coming soon.
      </p>
    </div>
  `,
})
export class ExamBuilderComponent {}
