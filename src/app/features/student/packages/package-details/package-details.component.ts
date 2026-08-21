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
  ClassroomFeedbackSummaryDto,
  ClassroomFeedbackItemDto
} from '../../../../core/services/student-enrollment.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'draya-package-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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

  activationCode = '';

  // Feedback state
  readonly feedbackSummary = signal<ClassroomFeedbackSummaryDto | null>(null);
  readonly feedbackLoading = signal<boolean>(false);
  feedbackRating = 5;
  feedbackComment = '';
  readonly submittingFeedback = signal<boolean>(false);

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
        this.loadFeedback(pkgId);
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
    });
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

  onSelectLesson(lesson: LessonItem): void {
    if (this.isEnrolled()) {
      if (lesson.type === 'exam') {
        this.toast.info('اختبار تدريبي', `جارٍ الانتقال للامتحان: ${lesson.title}`);
        this.router.navigate(['/student/exams']);
        return;
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

  loadFeedback(classroomId: string): void {
    this.feedbackLoading.set(true);
    this.enrollmentService.getClassroomFeedback(classroomId, 1, 5).subscribe({
      next: (res) => {
        this.feedbackSummary.set(res);
        this.feedbackLoading.set(false);
      },
      error: () => {
        this.feedbackLoading.set(false);
      }
    });
  }

  onSubmitFeedback(): void {
    const pkgId = this.pkg()?.id;
    if (!pkgId) return;

    if (this.feedbackRating < 1 || this.feedbackRating > 5) {
      this.toast.warning('تنبيه', 'يرجى تقييم الباقة من 1 إلى 5.');
      return;
    }

    this.submittingFeedback.set(true);
    this.enrollmentService.submitClassroomFeedback(pkgId, {
      rating: this.feedbackRating,
      comment: this.feedbackComment
    }).subscribe({
      next: (res) => {
        this.submittingFeedback.set(false);
        if (res.success) {
          this.toast.success('نجاح', 'تم إرسال تقييمك بنجاح. شكراً لك!');
          this.feedbackRating = 5;
          this.feedbackComment = '';
          this.loadFeedback(pkgId);
        } else {
          this.toast.error('خطأ', res.message || 'حدث خطأ أثناء إرسال التقييم.');
        }
      },
      error: () => {
        this.submittingFeedback.set(false);
        this.toast.error('خطأ', 'حدث خطأ أثناء الاتصال بالخادم.');
      }
    });
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((x, i) => i + 1);
  }
}

