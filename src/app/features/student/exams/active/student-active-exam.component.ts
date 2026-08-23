import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentExamTakingService } from '../../../../core/services/student-exam-taking.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ExamQuestionCardComponent } from '../components/exam-question-card/exam-question-card.component';
import { ExamQuestionMapComponent } from '../components/exam-question-map/exam-question-map.component';
import { ExamSecurityWarningComponent } from '../components/exam-security-warning/exam-security-warning.component';

@Component({
  selector: 'app-student-active-exam',
  standalone: true,
  imports: [
    CommonModule,
    ExamQuestionCardComponent,
    ExamQuestionMapComponent,
    ExamSecurityWarningComponent,
  ],
  templateUrl: './student-active-exam.component.html',
  styleUrl: './student-active-exam.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentActiveExamComponent implements OnInit, OnDestroy {
  protected readonly examService = inject(StudentExamTakingService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.toastService.warning('تنبيه أمني ⚠️', 'النقر بالزر الأيمن غير مسموح به أثناء الامتحان.');
  }

  @HostListener('copy', ['$event'])
  onCopy(event: ClipboardEvent): void {
    event.preventDefault();
    this.toastService.warning('تنبيه أمني ⚠️', 'نسخ أسئلة ومحتوى الامتحان محظور.');
  }

  @HostListener('cut', ['$event'])
  onCut(event: ClipboardEvent): void {
    event.preventDefault();
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+P, Ctrl+U, Ctrl+S
    if (
      (event.ctrlKey || event.metaKey) &&
      ['c', 'v', 'x', 'p', 's', 'u'].includes(event.key.toLowerCase())
    ) {
      event.preventDefault();
      this.toastService.warning('تنبيه أمني ⚠️', 'اختصارات لوحة المفاتيح معطلة أثناء الامتحان.');
    }
    if (event.key === 'F12') {
      event.preventDefault();
    }
  }

  readonly showSubmitConfirm = signal<boolean>(false);
  private examId = '';
  private visibilityListener: (() => void) | null = null;

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.examId) {
      this.toastService.error('امتحان غير صالح', 'تعذر تحديد الامتحان المطلوب.');
      this.router.navigate(['/student/exams']);
      return;
    }

    this.examService.loadExamSession(this.examId).subscribe({
      next: () => {
        const reason = this.examService.startAttemptFailureReason();
        if (this.examService.isAttemptAlreadyCompleted()) {
          this.toastService.info(
            'تم تسليم الامتحان مسبقاً 📋',
            'لقد قمت بإجراء وتسليم هذا الامتحان بالفعل. جاري نقلك لتقرير النتيجة والتصحيح...',
          );
          this.router.navigate(['/student/exams', this.examId, 'result']);
        } else if (reason === 'exam-expired') {
          this.toastService.error(
            'انتهى موعد الامتحان ⛔',
            'لم يعد بإمكانك بدء محاولة جديدة لهذا الامتحان.',
          );
          this.router.navigate(['/student/exams']);
        } else if (reason === 'attempt-in-progress') {
          this.toastService.info('استكمال المحاولة', 'جارٍ استكمال محاولتك الحالية لهذا الامتحان.');
        }
      },
      error: () => void 0,
    });

    // Anti-cheating tab-switching listener
    this.visibilityListener = () => {
      if (document.hidden) {
        const vCount = this.examService.recordViolation();
        if (vCount >= 3) {
          this.toastService.error(
            'تم تسليم الامتحان تلقائياً!',
            'لتكرار مغادرة شاشة الامتحان التفاعلي (3 مخالفات)، تم تسليم إجاباتك الحالية للتصحيح.',
          );
          // Submit whatever was answered so far and let the server score it —
          // forcing a fabricated 0% here would discard real answers and never
          // reach the backend at all.
          this.onSubmitExam();
        } else {
          this.toastService.warning(
            'تحذير أمني مشدد ⚠️',
            `لقد غادرت شاشة الامتحان (مخالفة رقم ${vCount} من أصل 3). تكرار ذلك سيلغي الاختبار!`,
          );
        }
      }
    };

    document.addEventListener('visibilitychange', this.visibilityListener);
  }

  ngOnDestroy(): void {
    this.examService.stopTimer();
    if (this.visibilityListener) {
      document.removeEventListener('visibilitychange', this.visibilityListener);
      this.visibilityListener = null;
    }
  }

  onSelectOption(event: { questionId: string; optionId: string }): void {
    this.examService.selectOption(event.questionId, event.optionId);
  }

  onUpdateAnswerText(event: { questionId: string; text: string }): void {
    this.examService.setAnswerText(event.questionId, event.text);
  }

  onToggleFlag(questionId: string): void {
    this.examService.toggleFlagQuestion(questionId);
    this.toastService.info('تحديث المراجعة', 'تم تعديل علامة المراجعة للسؤال.');
  }

  onGoToQuestion(index: number): void {
    this.examService.goToQuestion(index);
  }

  onSelectQuestionNav(index: number): void {
    this.examService.goToQuestion(index);
  }

  onNextQuestion(): void {
    this.examService.nextQuestion();
  }

  onPrevQuestion(): void {
    this.examService.prevQuestion();
  }

  onTriggerSubmit(): void {
    this.showSubmitConfirm.set(true);
  }

  onCancelSubmit(): void {
    this.showSubmitConfirm.set(false);
  }

  onConfirmSubmit(): void {
    this.showSubmitConfirm.set(false);
    this.onSubmitExam();
  }

  onReturnToExams(): void {
    this.router.navigate(['/student/exams']);
  }

  onRetryLoad(): void {
    this.examService.loadExamSession(this.examId).subscribe({
      next: () => void 0,
      error: () => void 0,
    });
  }

  onRetryLoading(): void {
    this.onRetryLoad();
  }

  onSubmitExam(): void {
    const attemptId = this.examService.currentAttemptId() || undefined;
    if (!attemptId) {
      // submitExam() will itself toast a clear error and refuse to call the
      // backend — nothing to submit without a known attempt, so stay put.
      this.examService.submitExam(undefined);
      return;
    }

    this.toastService.success(
      'تم تسليم الامتحان بنجاح! 🎉',
      'جارٍ استخراج تقرير التحليل الذكي للدرجات والمهارات...',
    );
    this.examService.submitExam(attemptId);
    this.router.navigate(['/student/exams', this.examId, 'result'], {
      queryParams: { attemptId },
    });
  }
}
