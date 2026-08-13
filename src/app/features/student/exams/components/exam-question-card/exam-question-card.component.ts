// src/app/features/student/exams/components/exam-question-card/exam-question-card.component.ts

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExamQuestion } from '../../../../../core/models/student-exam-taking.model';

@Component({
  selector: 'app-exam-question-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-question-card.component.html',
  styleUrl: './exam-question-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamQuestionCardComponent {
  readonly question = input.required<ExamQuestion>();
  readonly totalQuestionsCount = input.required<number>();
  readonly isFirstQuestion = input.required<boolean>();
  readonly isLastQuestion = input.required<boolean>();

  readonly selectOption = output<{ questionId: string; optionId: string }>();
  readonly toggleFlag = output<string>();
  readonly nextQuestion = output<void>();
  readonly prevQuestion = output<void>();
  readonly submitExam = output<void>();

  onSelect(optionId: string): void {
    this.selectOption.emit({ questionId: this.question().id, optionId });
  }
}
