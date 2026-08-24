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
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexFill,
  ApexGrid,
  ApexDataLabels,
  ApexTooltip,
  ApexMarkers,
} from 'ng-apexcharts';
import { StudentReportsService } from '../../../core/services/student-reports.service';
import { StudentExamsService } from '../../../core/services/student-exams.service';
import { StudentWeaknessService } from '../../../core/services/student-weakness.service';
import { StudentExamSummaryDto as ExamDto } from '../../../core/models/student-exam.model';
import { GenerationStatus } from '../../../core/models/exam-generation.model';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReportKpiCardComponent } from './components/report-kpi-card/report-kpi-card.component';
import { ReportWeaknessTopicComponent } from './components/report-weakness-topic/report-weakness-topic.component';
import { ResolvedWeaknessItemComponent } from './components/resolved-weakness-item/resolved-weakness-item.component';
import { DrayaEmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { MarkdownRendererComponent } from '../../../shared/components/markdown-renderer/markdown-renderer.component';
import { DrayaCardSkeletonComponent } from '../../../shared/components/card-skeleton/card-skeleton.component';
import {
  ReportWeaknessTopic,
  TopicRevisionDto,
  TrendPointResult,
} from '../../../core/models/student-reports.model';

import { SignalRService } from '../../../core/signalr/signalr.service';

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

// Skill radar geometry (viewBox 0 0 240 220) — an N-sided web instead of a
// fixed pentagon, since the student's actual subject count varies.
// RADAR_CENTER_Y is offset down from the 110 vertical midpoint: with the
// label offset added on top of the radius, the topmost axis label's baseline
// otherwise lands right at y=4, and its ascenders get clipped by the SVG's
// y=0 edge (this is the "label hidden behind something" bug at the top of
// the chart).
const RADAR_CENTER_X = 120;
const RADAR_CENTER_Y = 112;
const RADAR_MAX_RADIUS = 80;
const RADAR_RING_LEVELS = [25, 50, 75, 100];
const RADAR_LABEL_OFFSET = 16;
const RADAR_MIN_SUBJECTS = 3;

interface RadarChartLabel {
  readonly x: number;
  readonly y: number;
  readonly text: string;
  readonly anchor: 'start' | 'middle' | 'end';
}

interface RadarChartSpoke {
  readonly x2: number;
  readonly y2: number;
}

interface RadarChartViewModel {
  readonly ringPoints: readonly string[];
  readonly spokes: readonly RadarChartSpoke[];
  readonly skillPolygonPoints: string;
  readonly labels: readonly RadarChartLabel[];
}

// Radar shows at most this many subjects, even when the student has more —
// beyond ~5 axes the web gets crowded and labels start colliding.
const RADAR_MAX_SUBJECTS = 5;

interface TrendChartOptions {
  readonly series: ApexAxisChartSeries;
  readonly chart: ApexChart;
  readonly xaxis: ApexXAxis;
  readonly yaxis: ApexYAxis;
  readonly stroke: ApexStroke;
  readonly fill: ApexFill;
  readonly grid: ApexGrid;
  readonly dataLabels: ApexDataLabels;
  readonly tooltip: ApexTooltip;
  readonly markers: ApexMarkers;
  readonly colors: string[];
}

type GrowthTone = 'positive' | 'negative' | 'neutral';

interface GrowthPillViewModel {
  readonly text: string;
  readonly tone: GrowthTone;
}

/** Converts one trend point to a 0-100 percentage using averageMaxScore when available. */
function trendPointPercent(t: TrendPointResult): number {
  if (typeof t.averageScore !== 'number') return 0;
  if (typeof t.averageMaxScore === 'number' && t.averageMaxScore > 0) {
    return Math.max(0, Math.min(100, (t.averageScore / t.averageMaxScore) * 100));
  }
  return Math.max(0, Math.min(100, t.averageScore));
}

function trendPointLabel(t: TrendPointResult): string {
  if (t.monthName) return t.monthName;
  if (t.month) {
    const d = new Date(t.month);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('ar-EG', { month: 'short' });
    }
  }
  return '';
}

@Component({
  selector: 'app-student-reports',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
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
  readonly trendPoints = this.reportsService.trendPoints;
  readonly isLoading = this.reportsService.isLoading;

  /**
   * Renders the actual skillPoints() data as an N-sided radar web instead of
   * the fixed 5-axis pentagon mockup this card used to show regardless of the
   * student's real subjects. Null below RADAR_MIN_SUBJECTS — a 1-2 point
   * "radar" doesn't read as a meaningful shape. Capped to the top
   * RADAR_MAX_SUBJECTS by score — beyond that the web gets crowded and axis
   * labels start colliding with each other.
   */
  readonly radarChart = computed<RadarChartViewModel | null>(() => {
    const points = [...this.skillPoints()]
      .sort((a, b) => b.percent - a.percent)
      .slice(0, RADAR_MAX_SUBJECTS);
    const n = points.length;
    if (n < RADAR_MIN_SUBJECTS) return null;

    const angleFor = (i: number) => (-90 + (i * 360) / n) * (Math.PI / 180);
    const vertexAt = (i: number, radius: number) => {
      const angle = angleFor(i);
      return {
        x: RADAR_CENTER_X + radius * Math.cos(angle),
        y: RADAR_CENTER_Y + radius * Math.sin(angle),
      };
    };

    const ringPoints = RADAR_RING_LEVELS.map((level) => {
      const r = (RADAR_MAX_RADIUS * level) / 100;
      return Array.from({ length: n }, (_, i) => {
        const v = vertexAt(i, r);
        return `${v.x.toFixed(1)},${v.y.toFixed(1)}`;
      }).join(' ');
    });

    const spokes: RadarChartSpoke[] = Array.from({ length: n }, (_, i) => {
      const v = vertexAt(i, RADAR_MAX_RADIUS);
      return { x2: v.x, y2: v.y };
    });

    const skillPolygonPoints = points
      .map((p, i) => {
        const clamped = Math.max(0, Math.min(100, p.percent));
        const v = vertexAt(i, (RADAR_MAX_RADIUS * clamped) / 100);
        return `${v.x.toFixed(1)},${v.y.toFixed(1)}`;
      })
      .join(' ');

    const labels: RadarChartLabel[] = points.map((p, i) => {
      const v = vertexAt(i, RADAR_MAX_RADIUS + RADAR_LABEL_OFFSET);
      const dx = v.x - RADAR_CENTER_X;
      const anchor: 'start' | 'middle' | 'end' = dx > 8 ? 'start' : dx < -8 ? 'end' : 'middle';
      return { x: v.x, y: v.y, text: p.name, anchor };
    });

    return { ringPoints, spokes, skillPolygonPoints, labels };
  });

  /**
   * Renders the actual trendPoints() series as a real ApexCharts area chart.
   * With only one real month on record there's nothing to draw a meaningful
   * trend line between, so a lone floating dot used to be the result — instead
   * a synthetic leading point at the same value is prepended (unlabeled) so
   * the line reads as a flat baseline that will start moving once a second
   * month of real data lands, rather than an isolated marker.
   */
  readonly trendChart = computed<TrendChartOptions | null>(() => {
    const points = this.trendPoints();
    if (points.length === 0) return null;

    const categories = points.map((t) => trendPointLabel(t));
    const data = points.map((t) => Math.round(trendPointPercent(t) * 10) / 10);

    if (points.length === 1) {
      categories.unshift('');
      data.unshift(data[0]);
    }

    return {
      series: [{ name: 'المتوسط التراكمي', data }],
      chart: {
        type: 'area',
        height: '100%',
        fontFamily: 'Cairo, sans-serif',
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true },
      },
      colors: ['#0F4F49'],
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0, stops: [0, 90, 100] },
      },
      dataLabels: { enabled: false },
      markers: {
        size: points.length === 1 ? [0, 5] : 4,
        colors: ['#0F4F49'],
        strokeColors: '#ffffff',
        strokeWidth: 2,
        hover: { size: 6 },
      },
      grid: {
        borderColor: '#F1F5F9',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#64748B', fontSize: '11px', fontFamily: 'Cairo' } },
      },
      yaxis: {
        min: 0,
        max: 100,
        tickAmount: 4,
        labels: {
          style: { colors: '#64748B', fontSize: '10px', fontFamily: 'Cairo' },
          formatter: (v: number) => `${Math.round(v)}`,
        },
      },
      tooltip: {
        theme: 'light',
        y: { formatter: (v: number) => `${v}%` },
      },
    };
  });

  /** Wording/tone must reflect the real trend — a fixed "positive" pill lies when the student is declining. */
  readonly growthPill = computed<GrowthPillViewModel | null>(() => {
    if (this.trendPoints().length < 2) return null;
    const growth = this.summary().monthlyGrowthPercent;
    if (growth > 0) return { text: 'تطور إيجابي مستمر ✨', tone: 'positive' };
    if (growth < 0) return { text: 'انخفاض في الأداء ⚠️', tone: 'negative' };
    return { text: 'أداء مستقر 〰️', tone: 'neutral' };
  });

  // Weaknesses are driven by the dedicated /Weaknesses/active and
  // /Weaknesses/resolved endpoints. proficiencyPercent is a topic-level
  // metric — it is NOT the same thing as any single exam's score, so it must
  // never be substituted with a fuzzy-matched exam's scorePercent (a prior
  // version of this code did exactly that, which silently mixed two
  // unrelated numbers together). See NOTES_FOR_BACKEND_DEVS.md Note 16 if
  // this field is ever observed to arrive on a non-percentage scale — that's
  // a backend contract issue to fix at the source, not something to guess
  // around here.
  readonly activeWeaknessTopics = computed(() => {
    const list = this.weaknessService.activeWeaknesses();

    return list.map((w) => {
      const finalScore = Math.max(0, Math.min(100, Math.round(w.proficiencyPercent)));
      const isSevere = finalScore < 50;
      return {
        id: w.id,
        topicTitle: w.topicName,
        subjectName: w.subjectName,
        badgeText: isSevere ? 'فرصة للتحسين والتعزيز ⚡' : 'في مسار الإتقان 📈',
        scorePercent: finalScore,
        barMarkerColor: isSevere ? '#FF2056' : '#FE9A00',
        badgeBgColor: isSevere ? '#FFE4E6' : '#FEF3C6',
        badgeTextColor: isSevere ? '#A50036' : '#973C00',
        scoreTextColor: isSevere ? '#EC003F' : '#E17100',
        exampleIncorrectAnswers: w.exampleIncorrectAnswers,
      };
    });
  });
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
  readonly cachedTopicReviews = signal<Record<string, TopicRevisionDto>>({});

  isTopicReviewed(topicTitle: string): boolean {
    const clean = (topicTitle || '').trim().toLowerCase();
    return !!this.cachedTopicReviews()[clean];
  }

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
    this.examsService.loadExams();
    this.weaknessService.loadActiveWeaknesses().subscribe();
    this.weaknessService.loadResolvedWeaknesses().subscribe();
    this.loadCachedReviewsFromStorage();
  }

  private getStorageKey(): string {
    const studentId = this.resolveStudentId() || 'anonymous';
    return `draya_topic_reviews_${studentId}`;
  }

  private loadCachedReviewsFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.getStorageKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.cachedTopicReviews.set(parsed);
        }
      }
    } catch {
      // fallback silently
    }
  }

  private saveCachedReviewsToStorage(): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.cachedTopicReviews()));
    } catch {
      // fallback silently
    }
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
    const cleanTitle = (topic.topicTitle || '').trim();
    const normalizedKey = cleanTitle.toLowerCase();
    this.currentTopicTitle.set(cleanTitle);
    this.currentSubjectId.set(topic.subjectId);

    // 1. Check local cache to avoid duplicate API calls if review was already generated
    const cached = this.cachedTopicReviews()[normalizedKey];
    if (cached) {
      this.activeRevision.set(cached);
      this.loadingRevision.set(false);
      this.revisionLoadFailed.set(false);
      this.showRevisionModal.set(true);
      return;
    }

    // 2. Otherwise fetch from backend interactive-review endpoint
    this.showRevisionModal.set(true);
    this.loadingRevision.set(true);
    this.revisionLoadFailed.set(false);

    this.reportsService.getTopicRevision(studentId, cleanTitle).subscribe((rev) => {
      this.loadingRevision.set(false);
      if (!rev) {
        this.revisionLoadFailed.set(true);
        this.activeRevision.set(null);
        return;
      }
      this.activeRevision.set(rev);
      // Cache the successfully generated/fetched review
      this.cachedTopicReviews.update((map) => ({
        ...map,
        [normalizedKey]: rev,
      }));
      this.saveCachedReviewsToStorage();
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

  onDownloadPdf(): void {
    const rev = this.activeRevision();
    if (!rev) return;

    const topic = this.currentTopicTitle() || 'مراجعة الذكاء الاصطناعي';
    const dateStr = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const studentUser = this.authService.currentUser();
    const studentName = studentUser?.fullName || studentUser?.email || 'طالب منصة دراية';

    // Helper to format Markdown lines to HTML for print
    const formatMd = (text: string | null | undefined): string => {
      if (!text) return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>')
        .replace(/\n- (.*)/g, '<li>$1</li>')
        .replace(/\n\d+\. (.*)/g, '<li>$1</li>');
    };

    const recHtml = formatMd(rev.recommendation);
    const expHtml = formatMd(rev.aiExplanation);

    const incorrectList = (rev.exampleIncorrectAnswers || [])
      .map((ans) => `<li>${ans}</li>`)
      .join('');
    const formulasList = (rev.keyFormulas || []).map((f) => `<li>${f}</li>`).join('');

    const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>مراجعة وتشخيص - ${topic}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Fira+Code:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      padding: 24px;
      line-height: 1.6;
      direction: rtl;
      text-align: right;
    }
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 15mm 15mm;
    }
    @media print {
      body {
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
    .header-card {
      background: linear-gradient(135deg, #1B6D63 0%, #0d4a43 100%);
      color: #ffffff;
      padding: 20px 24px;
      border-radius: 14px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-subtitle {
      font-size: 13px;
      opacity: 0.9;
    }
    .meta-box {
      text-align: left;
      font-size: 12px;
      opacity: 0.95;
      line-height: 1.5;
    }
    .meta-box span {
      font-weight: 700;
    }
    .section-card {
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .section-teal {
      background-color: #f0fdf9;
      border: 1px solid #99f6e4;
    }
    .section-teal h3 {
      color: #115e59;
    }
    .section-slate {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .section-slate h3 {
      color: #0f172a;
    }
    .section-rose {
      background-color: #fff1f2;
      border: 1px solid #fecdd3;
    }
    .section-rose h3 {
      color: #9f1239;
    }
    .section-amber {
      background-color: #fffbeb;
      border: 1px solid #fde68a;
    }
    .section-amber h3 {
      color: #92400e;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .content-body {
      font-size: 13px;
      color: #334155;
      line-height: 1.7;
    }
    .content-body p { margin-bottom: 8px; }
    .content-body ul { margin-right: 20px; margin-bottom: 8px; }
    .content-body li { margin-bottom: 4px; }
    .code-block {
      background-color: #0f172a;
      color: #f8fafc;
      font-family: 'Fira Code', Consolas, monospace;
      padding: 12px 16px;
      border-radius: 8px;
      direction: ltr;
      text-align: left;
      font-size: 12px;
      line-height: 1.5;
      overflow-x: auto;
      margin: 12px 0;
    }
    .inline-code {
      background-color: #e2e8f0;
      color: #0f172a;
      font-family: 'Fira Code', monospace;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      direction: ltr;
      display: inline-block;
    }
    .footer-bar {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="header-card">
    <div>
      <div class="brand-title">
        <span>🤖</span>
        <span>منصة دراية | تقرير المراجعة والتشخيص الذكي</span>
      </div>
      <div class="brand-subtitle">الموضوع: ${topic}</div>
    </div>
    <div class="meta-box">
      <div>الطالب: <span>${studentName}</span></div>
      <div>التاريخ: <span>${dateStr}</span></div>
    </div>
  </div>

  ${
    recHtml
      ? `
  <div class="section-card section-teal">
    <div class="section-title">
      <span>💡</span>
      <span>التوصية الأكاديمية</span>
    </div>
    <div class="content-body">
      ${recHtml}
    </div>
  </div>`
      : ''
  }

  ${
    expHtml
      ? `
  <div class="section-card section-slate">
    <div class="section-title">
      <span>🔍</span>
      <span>التحليل التشخيصي والمفاهيم الجوهرية</span>
    </div>
    <div class="content-body">
      ${expHtml}
    </div>
  </div>`
      : ''
  }

  ${
    incorrectList
      ? `
  <div class="section-card section-rose">
    <div class="section-title">
      <span>⚠️</span>
      <span>أمثلة على الإجابات غير الدقيقة ونقاط الانتباه</span>
    </div>
    <div class="content-body">
      <ul>${incorrectList}</ul>
    </div>
  </div>`
      : ''
  }

  ${
    formulasList
      ? `
  <div class="section-card section-amber">
    <div class="section-title">
      <span>📌</span>
      <span>القوانين والنقاط المفتاحية</span>
    </div>
    <div class="content-body">
      <ul>${formulasList}</ul>
    </div>
  </div>`
      : ''
  }

  <div class="footer-bar">
    <span>منصة دراية للتعليم الذكي © ${new Date().getFullYear()}</span>
    <span>تقرير تشخيصي صادر بالذكاء الاصطناعي</span>
  </div>
</body>
</html>`;

    // Create a printable hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
          }
        } finally {
          setTimeout(() => {
            iframe.remove();
          }, 3000);
        }
      }, 300);

      this.toastService.info(
        'جاري تجهيز ملف الـ PDF 📄',
        'تم فتح نافذة الطباعة والحفظ بصيغة PDF بنجاح.',
      );
    }
  }
}
