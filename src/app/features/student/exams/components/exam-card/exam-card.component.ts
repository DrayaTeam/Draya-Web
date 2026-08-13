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
  readonly startExam = output<StudentExamItem>();
  readonly viewResults = output<StudentExamItem>();

  onButtonClick(): void {
    const item = this.exam();
    if (item.status === 'available') {
      this.startExam.emit(item);
    } else if (item.status === 'completed') {
      this.viewResults.emit(item);
    }
  }
}
