import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
  signal,
  effect,
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
  private examId = 'exam-1';
  private visibilityListener: (() => void) | null = null;

  constructor() {
    effect(() => {
      const remaining = this.examService.remainingSeconds();
      const isSub = this.examService.isSubmitted();
      const isLoading = this.examService.isLoading();
      if (remaining === 0 && !isSub && !isLoading) {
        this.toastService.warning(
          'انتهى وقت الامتحان! ⌛',
          'تم إرسال وتسليم إجاباتك تلقائياً للحفاظ على درجاتك قبل انتهاء المهلة.',
        );
        this.onSubmitExam();
      }
    });
  }

  ngOnInit(): void {
    this.examId = this.route.snapshot.paramMap.get('id') || 'exam-1';
    this.examService.loadExamSession(this.examId).subscribe({
      next: () => void 0,
      error: () => void 0,
    });

    // Anti-cheating tab-switching listener
    this.visibilityListener = () => {
      if (document.hidden) {
        const vCount = this.examService.recordViolation();
        if (vCount >= 3) {
          this.toastService.error(
            'تم إلغاء الامتحان تلقائياً!',
            'لتكرار مغادرة شاشة الامتحان التفاعلي (3 مخالفات).',
          );
          this.examService.stopTimer();
          const attemptId = this.examService.currentAttemptId() || undefined;
          this.router.navigate(['/student/exams', this.examId, 'result'], {
            queryParams: { score: 0, attemptId },
          });
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

  onNextQuestion(): void {
    this.examService.nextQuestion();
  }

  onPrevQuestion(): void {
    this.examService.prevQuestion();
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

  onSubmitExam(): void {
    const attemptId = this.examService.currentAttemptId() || undefined;
    const finalScore = this.examService.submitExam(attemptId);
    this.toastService.success(
      'تم تسليم الامتحان بنجاح! 🎉',
      'جارٍ استخراج تقرير التحليل الذكي للدرجات والمهارات...',
    );
    this.router.navigate(['/student/exams', this.examId, 'result'], {
      queryParams: { score: finalScore, attemptId },
    });
  }
}
