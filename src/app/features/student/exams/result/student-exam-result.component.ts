import { ChangeDetectionStrategy, Component, inject, OnInit, effect } from '@angular/core';
import { SignalRService } from '../../../../core/signalr/signalr.service';
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
  private readonly signalR = inject(SignalRService);

  readonly resultReport = this.examService.examResult;
  private attemptId: string | null = null;
  private examId: string | null = null;

  constructor() {
    effect(() => {
      const gradingCompleted = this.signalR.gradingCompleted();
      if (gradingCompleted && gradingCompleted.attemptId === this.attemptId) {
        this.toastService.success('اكتمل التصحيح', 'تم تحديث النتيجة بنجاح');
        this.loadResultsData();
      }
    });

    effect(() => {
      const answerScoreOverridden = this.signalR.answerScoreOverridden();
      if (answerScoreOverridden && answerScoreOverridden.attemptId === this.attemptId) {
        this.toastService.info('تحديث درجات', 'تم تعديل درجة أحد الأسئلة من قبل المعلم');
        this.loadResultsData();
      }
    });
  }

  ngOnInit(): void {
    this.examId = this.route.snapshot.params['id'] || null;
    this.attemptId =
      this.route.snapshot.queryParams['attemptId'] ||
      this.examService.currentAttemptId() ||
      this.examService.examResult().attemptId ||
      null;

    if (this.examId && this.examService.questions().length === 0) {
      this.examService.getExamDetails(this.examId).subscribe(() => {
        this.loadResultsData();
      });
    } else {
      this.loadResultsData();
    }
  }

  private loadResultsData(): void {
    if (this.attemptId) {
      this.examService.fetchAttemptResults(this.attemptId).subscribe();
      return;
    }

    if (!this.examId) return;

    this.examService.fetchExamStudentView(this.examId).subscribe((view) => {
      const attempts = view?.attempts || [];
      const latest = attempts.length > 0 ? attempts[attempts.length - 1] : null;
      if (latest) {
        this.attemptId = latest.id;
        this.examService.fetchAttemptResults(latest.id).subscribe();
      }
    });
  }

  onRecheckResult(): void {
    if (this.attemptId) {
      this.toastService.info('جاري التحقق...', 'سيتم الآن طلب التحقق من حالة التصحيح.');
      this.examService.isGradingInProgress.set(true);
      this.examService.gradingStage.set('ai_evaluating');
      this.examService.gradingProgressPercent.set(50);
      this.examService.pollAttemptResultsDirectly(this.attemptId, 3);
    } else if (this.examId) {
      this.toastService.info('جاري التحقق...', 'سيتم الآن طلب تحديث النتيجة من الخادم.');
      this.loadResultsData();
    }
  }

  onBackToExams(): void {
    this.examService.resetExamSession();
    this.router.navigate(['/student/exams']);
  }
}
