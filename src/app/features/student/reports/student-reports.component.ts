import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  effect,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentReportsService } from '../../../core/services/student-reports.service';
import { StudentExamsService } from '../../../core/services/student-exams.service';
import { StudentWeaknessService } from '../../../core/services/student-weakness.service';
import { StudentExamSummaryDto as ExamDto } from '../../../core/models/student-exam.model';
import { StudentWeaknessItem } from '../../../core/models/student-weakness.model';
import { GenerationStatus } from '../../../core/models/exam-generation.model';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReportKpiCardComponent } from './components/report-kpi-card/report-kpi-card.component';
import { ReportWeaknessTopicComponent } from './components/report-weakness-topic/report-weakness-topic.component';
import { ResolvedWeaknessItemComponent } from './components/resolved-weakness-item/resolved-weakness-item.component';
import { DrayaEmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { MarkdownRendererComponent } from '../../../shared/components/markdown-renderer/markdown-renderer.component';
import { DrayaCardSkeletonComponent } from '../../../shared/components/card-skeleton/card-skeleton.component';
import { ReportWeaknessTopic, TopicRevisionDto } from '../../../core/models/student-reports.model';

import { SignalRService } from '../../../core/signalr/signalr.service';

/** Same color-by-severity rule the old analytics-derived mapping used. */
function toReportWeaknessTopic(w: StudentWeaknessItem): ReportWeaknessTopic {
  const isSevere = w.proficiencyPercent < 50;
  return {
    id: w.id,
    topicTitle: w.topicName,
    subjectName: w.subjectName,
    badgeText: isSevere ? 'تحتاج تحسين عاجل' : 'في طور التحسن',
    scorePercent: w.proficiencyPercent,
    barMarkerColor: isSevere ? '#FF2056' : '#FE9A00',
    badgeBgColor: isSevere ? '#FFE4E6' : '#FEF3C6',
    badgeTextColor: isSevere ? '#A50036' : '#973C00',
    scoreTextColor: isSevere ? '#EC003F' : '#E17100',
    exampleIncorrectAnswers: w.exampleIncorrectAnswers,
  };
}

function normalizeGenerationStatus(status: number | string | undefined): GenerationStatus | null {
  if (typeof status === 'number') return status as GenerationStatus;
  if (typeof status === 'string') {
    const key = status.toLowerCase();
    const map: Record<string, GenerationStatus> = {
      pending: GenerationStatus.Pending,
      retrieving: GenerationStatus.Retrieving,
      generating: GenerationStatus.Generating,
      validating: GenerationStatus.Validating,
      completed: GenerationStatus.Completed,
      completedwithwarning: GenerationStatus.CompletedWithWarning,
      dataunavailable: GenerationStatus.DataUnavailable,
      failed: GenerationStatus.Failed,
    };
    return map[key] ?? null;
  }
  return null;
}

// Bound the HTTP polling fallback so a hung generation doesn't poll forever —
// SignalR is the primary channel; this only guards against it silently dropping.
const GENERATION_POLL_INTERVAL_MS = 5000;
const GENERATION_POLL_MAX_TRIES = 18; // ~90s

@Component({
  selector: 'app-student-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReportKpiCardComponent,
    ReportWeaknessTopicComponent,
    ResolvedWeaknessItemComponent,
    DrayaEmptyStateComponent,
    MarkdownRendererComponent,
    DrayaCardSkeletonComponent,
  ],
  templateUrl: './student-reports.component.html',
  styleUrl: './student-reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentReportsComponent implements OnInit, OnDestroy {
  protected readonly reportsService = inject(StudentReportsService);
  protected readonly weaknessService = inject(StudentWeaknessService);
  protected readonly signalR = inject(SignalRService);
  private readonly examsService = inject(StudentExamsService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private generationPollTries = 0;

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showRevisionModal()) {
      this.closeRevisionModal();
    }
  }

  readonly summary = this.reportsService.summary;
  readonly subjectScores = this.reportsService.subjectScores;
  readonly skillPoints = this.reportsService.skillRadarPoints;
  readonly isLoading = this.reportsService.isLoading;

  // Weaknesses are driven by the dedicated /Weaknesses/active and
  // /Weaknesses/resolved endpoints now, not scraped from analytics.weakTopics[].
  readonly activeWeaknessTopics = computed(() =>
    this.weaknessService.activeWeaknesses().map(toReportWeaknessTopic),
  );
  readonly resolvedWeaknesses = this.weaknessService.resolvedWeaknesses;
  readonly isLoadingWeaknesses = computed(
    () => this.weaknessService.isLoadingActive() || this.weaknessService.isLoadingResolved(),
  );

  // AI Interactive Revision Modal State
  readonly showRevisionModal = signal<boolean>(false);
  readonly loadingRevision = signal<boolean>(false);
  readonly generatingPractice = signal<boolean>(false);
  readonly generatingStatusText = signal<string>('جارٍ توليد الأسئلة بالذكاء الاصطناعي...');
  readonly activeRevision = signal<TopicRevisionDto | null>(null);
  readonly revisionLoadFailed = signal<boolean>(false);
  readonly currentTopicTitle = signal<string>('');
  readonly currentSubjectId = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const progress = this.signalR.generationProgressUpdated();
      if (!progress || !this.generatingPractice()) return;

      if (progress.status === 'InProgress') {
        this.generatingStatusText.set(
          progress.message || 'جارٍ توليد الأسئلة بالذكاء الاصطناعي...',
        );
      } else if (progress.status === 'Validating') {
        this.generatingStatusText.set(
          progress.message || 'جارٍ مراجعة واعتماد الأسئلة التدريبية...',
        );
      } else if (progress.status === 'Completed' && progress.examId) {
        this.stopPracticeExamPolling();
        this.generatingPractice.set(false);
        this.closeRevisionModal();
        this.toastService.success(
          'اكتمل تجهيز الاختبار التدريبي 🎉',
          'تم توليد الامتحان واعتماده بنجاح. بالتوفيق في التدريب!',
        );
        this.router.navigate(['/student/exams', progress.examId, 'take']);
      } else if (progress.status === 'DataUnavailable') {
        this.stopPracticeExamPolling();
        this.generatingPractice.set(false);
        this.toastService.warning(
          'محتوى غير كافٍ ⚠️',
          progress.error ||
            progress.message ||
            'لا توجد مواد ومحاضرات كافية لهذا الموضوع في صفك الدراسي حالياً.',
        );
      } else if (progress.status === 'Failed') {
        this.stopPracticeExamPolling();
        this.generatingPractice.set(false);
        this.toastService.error(
          'تعذر توليد الاختبار',
          progress.error || progress.message || 'حدث خطأ أثناء التوليد، يرجى المحاولة مرة أخرى.',
        );
      }
    });
  }

  ngOnInit(): void {
    this.reportsService.loadReports().subscribe({
      next: () => void 0,
      error: () => void 0,
    });
    this.weaknessService.loadActiveWeaknesses().subscribe();
    this.weaknessService.loadResolvedWeaknesses().subscribe();
  }

  ngOnDestroy(): void {
    this.stopPracticeExamPolling();
  }

  /**
   * Precise tracking once the backend confirms a generationId in the 202 body.
   * Mirrors the teacher module's generation-tracker fallback polling.
   */
  private startGenerationPolling(generationId: string): void {
    this.stopPracticeExamPolling();
    this.generationPollTries = 0;

    const poll = () => {
      this.generationPollTries++;
      if (this.generationPollTries > GENERATION_POLL_MAX_TRIES) {
        this.stopPracticeExamPolling();
        this.generatingPractice.set(false);
        this.toastService.info(
          'التوليد لا يزال قيد المعالجة',
          'يستغرق تجهيز الاختبار وقتاً أطول من المعتاد — تحقق من صفحة امتحاناتي بعد قليل.',
        );
        return;
      }

      this.reportsService.getPracticeExamGenerationStatus(generationId).subscribe((status) => {
        if (!this.generatingPractice() || !status) return;
        const normalized = normalizeGenerationStatus(status.status);

        if (
          normalized === GenerationStatus.Completed ||
          normalized === GenerationStatus.CompletedWithWarning
        ) {
          this.stopPracticeExamPolling();
          this.generatingPractice.set(false);
          this.closeRevisionModal();
          if (status.examId) {
            this.toastService.success(
              'اكتمل تجهيز الاختبار التدريبي 🎉',
              'تم توليد الامتحان واعتماده بنجاح. بالتوفيق في التدريب!',
            );
            this.router.navigate(['/student/exams', status.examId, 'take']);
          }
        } else if (normalized === GenerationStatus.DataUnavailable) {
          this.stopPracticeExamPolling();
          this.generatingPractice.set(false);
          this.toastService.warning(
            'محتوى غير كافٍ ⚠️',
            status.errorMessage ||
              status.message ||
              'لا توجد مواد ومحاضرات كافية لهذا الموضوع في صفك الدراسي حالياً.',
          );
        } else if (normalized === GenerationStatus.Failed) {
          this.stopPracticeExamPolling();
          this.generatingPractice.set(false);
          this.toastService.error(
            'تعذر توليد الاختبار',
            status.errorMessage ||
              status.message ||
              'حدث خطأ أثناء التوليد، يرجى المحاولة مرة أخرى.',
          );
        }
      });
    };

    poll();
    this.pollingTimer = setInterval(poll, GENERATION_POLL_INTERVAL_MS);
  }

  /**
   * Last-resort fallback for when the 202 response carries no id we can
   * recognize — fuzzy-matches the newly created exam by title. Kept only as a
   * degraded-mode path; prefer startGenerationPolling() whenever an id is present.
   */
  private startLegacyTitleMatchPolling(topicName: string): void {
    this.stopPracticeExamPolling();
    const startTime = Date.now();
    const cleanTopic = topicName.toLowerCase().replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');

    this.pollingTimer = setInterval(() => {
      // Poll for up to 45 seconds
      if (Date.now() - startTime > 45000) {
        this.stopPracticeExamPolling();
        return;
      }

      this.examsService.fetchExams(1, 5).subscribe({
        next: (items: ExamDto[]) => {
          if (!this.generatingPractice()) return;
          const found = items.find((e: ExamDto) => {
            const titleNorm = (e.title || '')
              .toLowerCase()
              .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');
            const topicNorm = (e.topic || '')
              .toLowerCase()
              .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '');
            return (
              (titleNorm.includes(cleanTopic) || topicNorm.includes(cleanTopic)) &&
              (titleNorm.includes('auto') ||
                titleNorm.includes('practice') ||
                titleNorm.includes('توليد') ||
                titleNorm.includes('تدريب'))
            );
          });

          const examId = found?.id;
          if (found && examId) {
            this.stopPracticeExamPolling();
            this.generatingPractice.set(false);
            this.closeRevisionModal();
            this.toastService.success(
              'اكتمل تجهيز الاختبار التدريبي 🎉',
              'تم تجهيز الامتحان بنجاح. بالتوفيق في التدريب!',
            );
            this.router.navigate(['/student/exams', examId, 'take']);
          }
        },
      });
    }, 3000);
  }

  private stopPracticeExamPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private resolveStudentId(): string | null {
    return this.authService.currentUser()?.userId || null;
  }

  onStartReview(topic: ReportWeaknessTopic): void {
    const studentId = this.resolveStudentId();
    if (!studentId) {
      this.toastService.error('خطأ في الجلسة', 'تعذر التعرف على حسابك، يرجى تسجيل الدخول مجدداً.');
      return;
    }
    this.currentTopicTitle.set(topic.topicTitle);
    this.currentSubjectId.set(topic.subjectId);
    this.showRevisionModal.set(true);
    this.loadingRevision.set(true);
    this.revisionLoadFailed.set(false);

    // No client-side cache and no fabricated fallback here on purpose — the
    // backend owns caching/invalidation of this response (see
    // BACKEND_ISSUES_REPORT.md), and a fake "successful" response on error
    // would hide real failures instead of surfacing them.
    this.reportsService.getTopicRevision(studentId, topic.topicTitle).subscribe((rev) => {
      this.loadingRevision.set(false);
      if (!rev) {
        this.revisionLoadFailed.set(true);
        this.activeRevision.set(null);
        return;
      }
      this.activeRevision.set(rev);
    });
  }

  onRetryRevision(): void {
    const topicTitle = this.currentTopicTitle();
    const match = this.activeWeaknessTopics().find((t) => t.topicTitle === topicTitle);
    if (match) {
      this.onStartReview(match);
    }
  }

  closeRevisionModal(): void {
    this.showRevisionModal.set(false);
    this.activeRevision.set(null);
    this.revisionLoadFailed.set(false);
  }

  onLaunchPracticeExam(): void {
    const studentId = this.resolveStudentId();
    if (!studentId) {
      this.toastService.error('خطأ في الجلسة', 'تعذر التعرف على حسابك، يرجى تسجيل الدخول مجدداً.');
      return;
    }
    const topic = this.currentTopicTitle().trim();

    this.generatingPractice.set(true);
    this.generatingStatusText.set('جارٍ الاتصال بنظام التوليد الذكي...');
    this.toastService.info(
      'تجهيز الاختبار بالذكاء الاصطناعي 🚀',
      'جارٍ إعداد اختبار مخصص لنقاط تحسينك...',
    );

    // Step 1 — Connect to SignalR Hub First
    this.signalR.startExamGenerationHub().then(() => {
      this.generatingStatusText.set('جارٍ إرسال طلب التوليد...');

      // Step 2 — Call Endpoint with empty body {}
      this.reportsService.createPracticeExam(studentId, topic).subscribe({
        next: (res) => {
          if (res?.examId) {
            // Immediate completion
            this.generatingPractice.set(false);
            this.closeRevisionModal();
            this.toastService.success(
              'تم تجهيز الاختبار التدريبي! 🎯',
              'جارٍ تحويلك الآن لبدء الاختبار...',
            );
            this.router.navigate(['/student/exams', res.examId, 'take']);
          } else {
            // Background generation started (202 Accepted).
            this.generatingStatusText.set('جارٍ توليد الأسئلة بالذكاء الاصطناعي...');
            const generationId = res?.generationId || res?.id;
            if (generationId) {
              this.startGenerationPolling(generationId);
            } else {
              // Backend didn't return a recognizable id — degrade to fuzzy
              // title matching rather than hanging with no fallback at all.
              this.startLegacyTitleMatchPolling(topic);
            }
          }
        },
        error: (err) => {
          this.generatingPractice.set(false);
          const errorMsg =
            err?.error?.message ||
            err?.error?.title ||
            'تعذر توليد الاختبار التدريبي، يرجى المحاولة لاحقاً.';
          this.toastService.error('تنبيه التوليد', errorMsg);
        },
      });
    });
  }
}
