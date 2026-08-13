// src/app/features/student/exams/components/exam-question-map/exam-question-map.component.ts

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamQuestion } from '../../../../../core/models/student-exam-taking.model';

@Component({
  selector: 'app-exam-question-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-question-map.component.html',
  styleUrl: './exam-question-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamQuestionMapComponent {
  readonly questions = input.required<readonly ExamQuestion[]>();
  readonly currentIndex = input.required<number>();

  readonly selectQuestionIndex = output<number>();

  isCurrent(index: number): boolean {
    return this.currentIndex() === index;
  }

  isAnswered(q: ExamQuestion): boolean {
    return !!q.selectedOptionId;
  }
}
