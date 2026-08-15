// src/app/features/student/packages/package-details/package-details.component.ts
import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  StudentEnrollmentService,
  PackageDetailsView,
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

  readonly loading = signal<boolean>(true);
  readonly activatingCode = signal<boolean>(false);
  readonly isEnrolled = signal<boolean>(false);
  readonly pkg = signal<PackageDetailsView | null>(null);

  activationCode = '';

  ngOnInit(): void {
    const pkgId = this.route.snapshot.paramMap.get('id') || 'pkg_1';

    // 1. Fetch package details
    this.enrollmentService.getPackageDetails(pkgId).subscribe({
      next: (data) => {
        this.pkg.set(data);
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
    });
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

  onGoToCheckout(pkgId: string): void {
    this.router.navigate(['/student/checkout', pkgId]);
  }

  onPlayLesson(lessonTitle: string): void {
    if (this.isEnrolled()) {
      this.toast.info('تشغيل المحاضرة', `جارٍ تشغيل: ${lessonTitle}`);
    } else {
      this.toast.warning('محتوى مغلق', 'يرجى الاشتراك في الباقة أولاً للوصول إلى هذا المحتوى.');
    }
  }
}
