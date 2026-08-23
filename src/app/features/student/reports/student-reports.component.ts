import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  effect,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentReportsService } from '../../../core/services/student-reports.service';
import { StudentExamsService } from '../../../core/services/student-exams.service';
import { StudentExamSummaryDto as ExamDto } from '../../../core/models/student-exam.model';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReportKpiCardComponent } from './components/report-kpi-card/report-kpi-card.component';
import { ReportWeaknessTopicComponent } from './components/report-weakness-topic/report-weakness-topic.component';
import { DrayaEmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { MarkdownRendererComponent } from '../../../shared/components/markdown-renderer/markdown-renderer.component';
import { DrayaCardSkeletonComponent } from '../../../shared/components/card-skeleton/card-skeleton.component';
import { ReportWeaknessTopic, TopicRevisionDto } from '../../../core/models/student-reports.model';

import { SignalRService } from '../../../core/signalr/signalr.service';

@Component({
  selector: 'app-student-reports',
  standalone: true,
  imports: [
    CommonModule,
    ReportKpiCardComponent,
    ReportWeaknessTopicComponent,
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
  protected readonly signalR = inject(SignalRService);
  private readonly examsService = inject(StudentExamsService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  private pollingTimer: ReturnType<typeof setInterval> | null = null;

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showRevisionModal()) {
      this.closeRevisionModal();
    }
  }

  readonly summary = this.reportsService.summary;
  readonly subjectScores = this.reportsService.subjectScores;
  readonly weaknessTopics = this.reportsService.weaknessTopics;
  readonly skillPoints = this.reportsService.skillRadarPoints;
  readonly isLoading = this.reportsService.isLoading;

  // AI Interactive Revision Modal State
  readonly showRevisionModal = signal<boolean>(false);
  readonly loadingRevision = signal<boolean>(false);
  readonly generatingPractice = signal<boolean>(false);
  readonly generatingStatusText = signal<string>('جارٍ توليد الأسئلة بالذكاء الاصطناعي...');
  readonly activeRevision = signal<TopicRevisionDto | null>(null);
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
  }

  ngOnDestroy(): void {
    this.stopPracticeExamPolling();
  }

  private startPracticeExamPolling(topicName: string): void {
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

  onStartReview(topic: ReportWeaknessTopic): void {
    const studentId = this.authService.currentUser()?.userId || 'me';
    this.currentTopicTitle.set(topic.topicTitle);
    this.currentSubjectId.set(topic.subjectId);
    this.showRevisionModal.set(true);
    this.loadingRevision.set(true);

    this.reportsService.getTopicRevision(studentId, topic.topicTitle).subscribe({
      next: (rev) => {
        const enrichedRevision: TopicRevisionDto = {
          topicName: rev?.topicName || topic.topicTitle,
          recommendation:
            rev?.recommendation ||
            topic.recommendation ||
            `يركز هذا الموضوع على المفاهيم الجوهرية لـ "${topic.topicTitle}". ننصح بمراجعة القوانين الأساسية وحل مسائل تدريبية.`,
          aiExplanation:
            rev?.aiExplanation ||
            `تم تحليل إجاباتك السابقة واكتشاف فرص واعدة لرفع دقة الحل في هذا الموضوع.`,
          keyFormulas: rev?.keyFormulas || [
            'مراجعة القوانين والنظريات الأساسية',
            'التطبيق التدريجي على نماذج الأسئلة',
          ],
          exampleIncorrectAnswers: rev?.exampleIncorrectAnswers || topic.exampleIncorrectAnswers,
        };
        this.activeRevision.set(enrichedRevision);
        this.loadingRevision.set(false);
      },
      error: () => {
        this.activeRevision.set({
          topicName: topic.topicTitle,
          recommendation:
            topic.recommendation ||
            `يركز هذا الموضوع على المفاهيم الجوهرية لـ "${topic.topicTitle}". ننصح بمراجعة القوانين الأساسية وحل مسائل تدريبية.`,
          aiExplanation: `تم تحليل إجاباتك السابقة واكتشاف فرص واعدة لرفع دقة الحل في هذا الموضوع.`,
          keyFormulas: ['مراجعة القوانين والنظريات الأساسية', 'التطبيق التدريجي على نماذج الأسئلة'],
          exampleIncorrectAnswers: topic.exampleIncorrectAnswers,
        });
        this.loadingRevision.set(false);
      },
    });
  }

  closeRevisionModal(): void {
    this.showRevisionModal.set(false);
    this.activeRevision.set(null);
  }

  onLaunchPracticeExam(): void {
    const studentId = this.authService.currentUser()?.userId || 'me';
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
            // Background generation started (202 Accepted)
            this.generatingStatusText.set('جارٍ توليد الأسئلة بالذكاء الاصطناعي...');
            this.startPracticeExamPolling(topic);
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
