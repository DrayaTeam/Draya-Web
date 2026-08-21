// src/app/features/student/exams/result/student-exam-result.component.ts

import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
export class StudentExamResultComponent implements OnInit {
  protected readonly examService = inject(StudentExamTakingService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly resultReport = this.examService.examResult;
  private attemptId: string | null = null;

  ngOnInit(): void {
    this.attemptId = this.route.snapshot.queryParams['attemptId'] || null;
    if (this.attemptId) {
      this.examService.fetchAttemptResults(this.attemptId).subscribe();
    } else {
      const scoreParam = this.route.snapshot.queryParams['score'];
      if (scoreParam !== undefined && scoreParam !== null) {
        const numericScore = Number(scoreParam);
        if (!isNaN(numericScore)) {
          let gradeLabel = 'راسب — ضعيف جداً';
          if (numericScore >= 85) gradeLabel = 'ممتاز جداً 🌟';
          else if (numericScore >= 65) gradeLabel = 'جيد جداً 👍';
          else if (numericScore >= 50) gradeLabel = 'مقبول — يحتاج مراجعة';

          this.examService.examResult.update((current) => ({
            ...current,
            scorePercentage: numericScore,
            gradeLabel,
            isPassed: numericScore >= 50,
            isGradingPending: false,
          }));
        }
      }
    }
  }

  onRecheckResult(): void {
    if (this.attemptId) {
      this.toastService.info('جارٍ التحقق...', 'يتم الآن فحص أحدث تقرير تصحيح من الخادم.');
      this.examService.isGradingInProgress.set(true);
      this.examService.gradingStage.set('ai_evaluating');
      this.examService.gradingProgressPercent.set(50);
      this.examService.pollAttemptResultsDirectly(this.attemptId, 3);
    } else {
      this.toastService.warning('تنبيه', 'لا يوجد معرف محاولة للتحقق منه.');
    }
  }

  onOpenLecture(lectureUrl: string): void {
    void lectureUrl;
    this.toastService.info('المحاضرة التأسيسية', `جاري التوجيه إلى المحاضرة التأسيسية للمراجعة...`);
    this.router.navigate(['/student/courses']);
  }

  onBackToExams(): void {
    this.router.navigate(['/student/exams']);
  }
}

