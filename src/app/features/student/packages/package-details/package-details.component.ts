// src/app/features/student/packages/package-details/package-details.component.ts
import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  StudentEnrollmentService,
  PackageDetailsView,
  LessonItem,
} from '../../../../core/services/student-enrollment.service';
import {
  ClassroomFeedbackItemDto,
  ClassroomFeedbackSummaryDto,
} from '../../../../core/models/student-courses.model';
import { ToastService } from '../../../../core/services/toast.service';
import { DrayaCardSkeletonComponent } from '../../../../shared/components/card-skeleton/card-skeleton.component';

@Component({
  selector: 'draya-package-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DrayaCardSkeletonComponent],
  templateUrl: './package-details.component.html',
  styleUrl: './package-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly enrollmentService = inject(StudentEnrollmentService);
  private readonly toast = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly loading = signal<boolean>(true);
  readonly activatingCode = signal<boolean>(false);
  readonly isEnrolled = signal<boolean>(false);
  readonly pkg = signal<PackageDetailsView | null>(null);

  // Accordion state: map chapterId to boolean
  readonly expandedChapters = signal<Record<string, boolean>>({ ch_1: true });

  // Modal / Preview state
  readonly selectedLesson = signal<LessonItem | null>(null);
  readonly showLockModal = signal<boolean>(false);

  // Tab selector state
  readonly activeTab = signal<'curriculum' | 'feedback'>('curriculum');

  // Feedback State Signals
  readonly feedbackSummary = signal<ClassroomFeedbackSummaryDto | null>(null);
  readonly feedbackItems = signal<ClassroomFeedbackItemDto[]>([]);
  readonly loadingFeedback = signal<boolean>(false);
  readonly submittingFeedback = signal<boolean>(false);
  readonly selectedRating = signal<number>(5);
  readonly hoverRating = signal<number>(0);
  readonly feedbackComment = signal<string>('');
  readonly hasSubmittedFeedback = signal<boolean>(false);

  activationCode = '';

  ngOnInit(): void {
    const pkgId = this.route.snapshot.paramMap.get('id') || 'pkg_1';

    // 1. Fetch package details
    this.enrollmentService.getPackageDetails(pkgId).subscribe({
      next: (data) => {
        this.pkg.set(data);
        // Expand first chapter by default
        if (data?.chapters?.length) {
          const initialMap: Record<string, boolean> = {};
          data.chapters.forEach((ch, i) => {
            initialMap[ch.id] = i === 0;
          });
          this.expandedChapters.set(initialMap);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });

    // 2. Check if student is already enrolled in this classroom
    this.enrollmentService.getEnrolledClassrooms().subscribe({
      next: (res) => {
        const items = res?.items || [];
        const enrolled = items.some(
          (c) => c.classroomId === pkgId || c.classroomId?.toLowerCase() === pkgId.toLowerCase(),
        );
        if (enrolled) {
          this.isEnrolled.set(true);
        }
      },
      error: () => void 0,
    });
  }

  loadFeedback(classroomId: string): void {
    this.loadingFeedback.set(true);
    this.enrollmentService.getClassroomFeedback(classroomId, 1, 20).subscribe({
      next: (res) => {
        if (res && Array.isArray(res.items)) {
          this.feedbackSummary.set(res);
          this.feedbackItems.set(res.items);
        } else {
          this.feedbackSummary.set({
            averageRating: 0,
            totalCount: 0,
            items: [],
            pageNumber: 1,
            pageSize: 20,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          });
          this.feedbackItems.set([]);
        }
        this.loadingFeedback.set(false);
      },
      error: () => {
        this.feedbackSummary.set({
          averageRating: 0,
          totalCount: 0,
          items: [],
          pageNumber: 1,
          pageSize: 20,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        });
        this.feedbackItems.set([]);
        this.loadingFeedback.set(false);
      },
    });
  }

  setRating(star: number): void {
    this.selectedRating.set(star);
  }

  setHoverRating(star: number): void {
    this.hoverRating.set(star);
  }

  submitFeedback(): void {
    const pkgId = this.route.snapshot.paramMap.get('id') || 'pkg_1';
    const rating = this.selectedRating();
    const comment = this.feedbackComment().trim();

    this.submittingFeedback.set(true);
    this.enrollmentService
      .submitClassroomFeedback(pkgId, { rating, comment: comment || undefined })
      .subscribe({
        next: (res) => {
          this.submittingFeedback.set(false);
          if (res.success) {
            this.toast.success('تم التقييم بنجاح', res.message || 'شكراً لمشاركتك رأيك!');
            this.hasSubmittedFeedback.set(true);

            // Optimistic prepend
            const newFeedback: ClassroomFeedbackItemDto = {
              feedbackId: res.data?.feedbackId || `fb_${Date.now()}`,
              studentName: 'أنا',
              rating,
              comment,
              createdAt: new Date().toISOString(),
            };

            this.feedbackItems.update((list) => [newFeedback, ...list]);
            this.feedbackSummary.update((s) =>
              s
                ? {
                    ...s,
                    totalCount: s.totalCount + 1,
                    averageRating: Number(
                      ((s.averageRating * s.totalCount + rating) / (s.totalCount + 1)).toFixed(1),
                    ),
                  }
                : null,
            );
            this.feedbackComment.set('');
          } else {
            this.toast.error('خطأ', res.message || 'تعذر إرسال التقييم.');
          }
        },
        error: () => {
          this.submittingFeedback.set(false);
          this.toast.error('خطأ', 'تعذر إرسال التقييم، يرجى المحاولة لاحقاً.');
        },
      });
  }

  selectTab(tab: 'curriculum' | 'feedback'): void {
    this.activeTab.set(tab);
    if (tab === 'feedback' && this.feedbackItems().length === 0 && !this.loadingFeedback()) {
      const pkgId = this.route.snapshot.paramMap.get('id') || 'pkg_1';
      this.loadFeedback(pkgId);
    }
  }

  toggleChapter(chapterId: string): void {
    this.expandedChapters.update((current) => ({
      ...current,
      [chapterId]: !current[chapterId],
    }));
  }

  isChapterExpanded(chapterId: string): boolean {
    return !!this.expandedChapters()[chapterId];
  }

  getLessonActionLabel(les: LessonItem): string {
    if (les.type === 'pdf') {
      return 'معاينة وتحميل 📄';
    }
    if (les.type === 'exam') {
      switch (les.examStatus) {
        case 'in-progress':
          return 'متابعة المحاولة ⏳';
        case 'pending-grading':
          return 'قيد التصحيح 🧠';
        case 'completed':
          return 'عرض النتيجة ✅';
        case 'scheduled': {
          if (les.startDate) {
            const dateStr = new Date(les.startDate).toLocaleDateString('ar-EG', {
              day: 'numeric',
              month: 'short',
            });
            return `يبدأ ${dateStr} ⏳`;
          }
          return 'مجدول لاحقاً ⏳';
        }
        case 'expired':
          return 'انتهت الفترة ⛔';
        case 'available':
        default:
          return 'امتحن الآن ✍️';
      }
    }
    return 'مشاهدة الآن ▶';
  }

  onSelectLesson(lesson: LessonItem): void {
    if (this.isEnrolled()) {
      if (lesson.type === 'exam') {
        const examId =
          lesson.id && !lesson.id.startsWith('les_') && !lesson.id.startsWith('exam_')
            ? lesson.id
            : null;

        switch (lesson.examStatus) {
          case 'scheduled': {
            const d = lesson.startDate
              ? new Date(lesson.startDate).toLocaleDateString('ar-EG', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';
            this.toast.info(
              'موعد الامتحان',
              d ? `هذا الامتحان مجدول وسيبدأ في: ${d}.` : 'هذا الامتحان لم يبدأ بعد.',
            );
            return;
          }
          case 'expired':
            this.toast.warning(
              'انتهت فترة الامتحان ⛔',
              'لقد انتهت الفترة الزمنية المحددة لأداء هذا الامتحان.',
            );
            return;
          case 'completed':
          case 'pending-grading':
            this.toast.info('تقرير النتيجة', `فتح تقرير الإجابات لاختبار: ${lesson.title}`);
            if (examId) {
              this.router.navigate(['/student/exams', examId, 'result'], {
                queryParams: lesson.latestAttemptId ? { attemptId: lesson.latestAttemptId } : {},
              });
            } else {
              this.router.navigate(['/student/exams']);
            }
            return;
          case 'in-progress':
          case 'available':
          default:
            this.toast.info('اختبار تدريبي', `جارٍ الانتقال للامتحان: ${lesson.title}`);
            if (examId) {
              this.router.navigate(['/student/exams', examId, 'take']);
            } else {
              this.router.navigate(['/student/exams']);
            }
            return;
        }
      }
      // Open lesson viewer modal
      this.selectedLesson.set(lesson);
      this.showLockModal.set(false);
    } else {
      // Prompt user with lock modal
      this.selectedLesson.set(lesson);
      this.showLockModal.set(true);
    }
  }

  closeModal(): void {
    this.selectedLesson.set(null);
    this.showLockModal.set(false);
  }

  getSafeUrl(url?: string): SafeResourceUrl | null {
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onRedeemCode(): void {
    if (!this.activationCode.trim()) {
      this.toast.warning('تنبيه', 'يرجى إدخال كود التفعيل أولاً.');
      return;
    }

    this.activatingCode.set(true);
    this.enrollmentService.enrollWithCode(this.activationCode).subscribe({
      next: (res) => {
        this.activatingCode.set(false);
        if (res.success) {
          this.isEnrolled.set(true);
          this.toast.success('تم التفعيل بنجاح', res.message);
        } else {
          this.toast.error('فشل التفعيل', res.message);
        }
      },
      error: () => {
        this.activatingCode.set(false);
        this.toast.error('خطأ', 'تعذر معالجة كود التفعيل.');
      },
    });
  }

  onGoToCheckout(pkgId?: string): void {
    const id = pkgId || this.pkg()?.id;
    if (id) {
      this.closeModal();
      this.router.navigate(['/student/checkout', id]);
    }
  }
}
