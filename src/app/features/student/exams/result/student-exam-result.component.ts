// src/app/features/student/exams/result/student-exam-result.component.ts

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentExamTakingService } from '../../../../core/services/student-exam-taking.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ExamResultCardComponent } from '../components/exam-result-card/exam-result-card.component';
import { ExamQuestionReviewCardComponent } from '../components/exam-question-review-card/exam-question-review-card.component';

@Component({
  selector: 'app-student-exam-result',
  standalone: true,
  imports: [CommonModule, ExamResultCardComponent, ExamQuestionReviewCardComponent],
  templateUrl: './student-exam-result.component.html',
  styleUrl: './student-exam-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentExamResultComponent {
  protected readonly examService = inject(StudentExamTakingService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly resultReport = this.examService.examResult;

  onOpenLecture(lectureUrl: string): void {
    this.toastService.info(
      'المحاضرة التأسيسية',
      `جاري التوجيه إلى المحاضرة التأسيسية للمراجعة: ${lectureUrl}`,
    );
  }

  onBackToExams(): void {
    this.router.navigate(['/student/exams']);
  }
}
