// src/app/features/student/exams/components/exam-card/exam-card.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { StudentExamItem } from '../../../../../core/models/student-exam.model';

@Component({
  selector: 'draya-exam-card',
  standalone: true,
  imports: [],
  templateUrl: './exam-card.component.html',
  styleUrl: './exam-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamCardComponent {
  readonly exam = input.required<StudentExamItem>();
  /** Start a fresh attempt, or resume the in-progress one. */
  readonly startExam = output<StudentExamItem>();
  /** View the result / grading status of the latest attempt. */
  readonly viewResults = output<StudentExamItem>();
  /** Start a new attempt on an exam that already has a completed one. */
  readonly retakeExam = output<StudentExamItem>();

  readonly canRetake = (): boolean => {
    const item = this.exam();
    return (
      item.status === 'completed' &&
      item.allowedAttempts !== undefined &&
      item.attemptsTaken !== undefined &&
      item.attemptsTaken < item.allowedAttempts
    );
  };

  onButtonClick(): void {
    const item = this.exam();
    switch (item.status) {
      case 'available':
      case 'in-progress':
        this.startExam.emit(item);
        break;
      case 'completed':
      case 'pending-grading':
        this.viewResults.emit(item);
        break;
      default:
        break;
    }
  }

  onRetakeClick(event: Event): void {
    event.stopPropagation();
    this.retakeExam.emit(this.exam());
  }
}
