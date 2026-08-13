// src/app/features/student/exams/components/exam-question-review-card/exam-question-review-card.component.ts

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamReviewItem } from '../../../../../core/models/student-exam-taking.model';

@Component({
  selector: 'app-exam-question-review-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-question-review-card.component.html',
  styleUrl: './exam-question-review-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamQuestionReviewCardComponent {
  readonly reviewItem = input.required<ExamReviewItem>();
}
