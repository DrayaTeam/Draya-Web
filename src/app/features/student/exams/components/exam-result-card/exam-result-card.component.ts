// src/app/features/student/exams/components/exam-result-card/exam-result-card.component.ts

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamResultReport } from '../../../../../core/models/student-exam-taking.model';

@Component({
  selector: 'app-exam-result-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-result-card.component.html',
  styleUrl: './exam-result-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamResultCardComponent {
  readonly report = input.required<ExamResultReport>();
  readonly openLecture = output<string>();
}
