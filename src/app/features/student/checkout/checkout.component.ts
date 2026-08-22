// src/app/features/student/checkout/checkout.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentEnrollmentService } from '../../../core/services/student-enrollment.service';
import { StudentCoursesService } from '../../../core/services/student-courses.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'draya-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly enrollmentService = inject(StudentEnrollmentService);
  private readonly coursesService = inject(StudentCoursesService);
  private readonly toast = inject(ToastService);

  readonly loading = signal<boolean>(false);
  readonly isPackageLoading = signal<boolean>(true);
  readonly success = signal<boolean>(false);
  readonly discount = signal<number>(0);

  // Awaiting Payment Verification State
  readonly isAwaitingPayment = signal<boolean>(false);
  readonly paymobUrl = signal<string>('');
  readonly verifyingManually = signal<boolean>(false);

  readonly pkgId = signal<string>('');
  readonly pkgName = signal<string>('جارٍ التحميل...');
  readonly teacherName = signal<string>('');
  readonly originalPrice = signal<number>(0);
  promoCode = '';

  readonly finalPrice = computed<number>(() => {
    return Math.max(0, this.originalPrice() - this.discount());
  });

  private popupRef: Window | null = null;
  private pollingSubscription?: ReturnType<typeof setInterval>;
  private messageListener?: (event: MessageEvent) => void;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.pkgId.set(id);

    // 1. Check if redirected back with status query params
    const queryParams = this.route.snapshot.queryParams;
    const isSuccess =
      queryParams['success'] === 'true' ||
      queryParams['status'] === 'success' ||
      queryParams['txn_response_code'] === 'APPROVED';
    const isFailed =
      queryParams['success'] === 'false' ||
      queryParams['status'] === 'failed' ||
      queryParams['txn_response_code'] === 'DECLINED';

    if (isSuccess) {
      this.handleSuccessfulPayment();
    } else if (isFailed) {
      this.toast.error('فشلت عملية الدفع', 'لم يتم خصم أي مبالغ، يرجى المحاولة مرة أخرى.');
    }

    // 2. Fetch real package details
    if (id) {
      this.isPackageLoading.set(true);
      this.enrollmentService.getPackageDetails(id).subscribe({
        next: (p) => {
          this.isPackageLoading.set(false);
          if (p) {
            this.pkgName.set(p.name || 'فصل دراسي');
            this.teacherName.set(p.teacherName || '');
            this.originalPrice.set(p.price ?? 0);
          }
        },
        error: () => {
          this.isPackageLoading.set(false);
          this.pkgName.set('فصل دراسي');
          this.teacherName.set('');
          this.originalPrice.set(0);
        },
      });
    } else {
      this.isPackageLoading.set(false);
      this.pkgName.set('فصل دراسي');
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.closePopupIfOpen();
  }

  applyPromo(): void {
    const code = this.promoCode.trim().toLowerCase();
    if (code === 'student10' || code === 'draya') {
      const disc = Math.round(this.originalPrice() * 0.15);
      this.discount.set(disc);
      this.toast.success('تم تطبيق الخصم', `تم خصم ${disc} جنيه بنجاح.`);
    } else {
      this.toast.error('كود غير صحيح', 'كوبون الخصم غير صالح أو منتهي الصلاحية.');
    }
  }

  onSubmitPayment(): void {
    const currentPkgId = this.pkgId();
    if (!currentPkgId) {
      this.toast.error('خطأ', 'معرف الفصل الدراسي غير موجود.');
      return;
    }

    this.loading.set(true);

    const redirectUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/payment/result`
        : 'https://draya.com/payment/result';

    this.enrollmentService.checkoutClassroom(currentPkgId, redirectUrl).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.checkoutUrl) {
          this.toast.info('جاري تحويلك لبوابة الدفع', 'سيتم نقلك لصفحة الدفع الآمنة من Paymob...');
          window.location.href = res.checkoutUrl;
        } else {
          this.toast.error(
            'خطأ في إتمام الدفع',
            res.message || 'تعذر الحصول على رابط Paymob من السيرفر.',
          );
        }
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('خطأ في المعاملة', 'تعذر استكمال الدفع، يرجى المحاولة مرة أخرى.');
      },
    });
  }

  private openCenteredPopup(url: string): Window | null {
    if (typeof window === 'undefined') return null;

    const width = 600;
    const height = 750;
    const screenW = window.screen.width || window.innerWidth || 1024;
    const screenH = window.screen.height || window.innerHeight || 768;
    const left = Math.max(0, Math.round((screenW - width) / 2));
    const top = Math.max(0, Math.round((screenH - height) / 2));

    const features = `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=no,toolbar=no,menubar=no,location=no,resizable=yes`;
    return window.open(url, 'DrayaPaymobPopup', features);
  }

  openPaymentUrl(): void {
    if (this.paymobUrl()) {
      this.popupRef = this.openCenteredPopup(this.paymobUrl());
    }
  }

  checkPaymentNow(): void {
    this.verifyingManually.set(true);
    this.enrollmentService.getEnrolledClassrooms().subscribe({
      next: (res) => {
        this.verifyingManually.set(false);
        const items = res?.items || [];
        const targetId = this.pkgId();
        const isEnrolled = items.some(
          (c) =>
            c.classroomId === targetId || c.classroomId?.toLowerCase() === targetId.toLowerCase(),
        );
        if (isEnrolled) {
          this.handleSuccessfulPayment();
        } else {
          this.toast.info(
            'جاري التحقق',
            'لم يتم تأكيد الدفع بعد. إذا قمت بالدفع للتو، انتظر بضع ثوانٍ وأعد المحاولة.',
          );
        }
      },
      error: () => {
        this.verifyingManually.set(false);
        this.toast.error('خطأ', 'تعذر التحقق من حالة الدفع حالياً.');
      },
    });
  }

  private startEnrollmentPolling(): void {
    this.stopPolling();

    // 1. Listen for postMessage from the popup window
    this.messageListener = (event: MessageEvent) => {
      const data = event.data;
      if (
        data &&
        (data.type === 'PAYMOB_PAYMENT_SUCCESS' ||
          data.status === 'success' ||
          data.message === 'Approved')
      ) {
        this.handleSuccessfulPayment();
      }
    };
    window.addEventListener('message', this.messageListener);

    // 2. Active background polling fallback (every 2.5 seconds)
    this.pollingSubscription = setInterval(() => {
      this.enrollmentService.getEnrolledClassrooms().subscribe({
        next: (res) => {
          const items = res?.items || [];
          const targetId = this.pkgId();
          const isEnrolled = items.some(
            (c) =>
              c.classroomId === targetId || c.classroomId?.toLowerCase() === targetId.toLowerCase(),
          );
          if (isEnrolled) {
            this.handleSuccessfulPayment();
          }
        },
      });
    }, 2500);
  }

  private handleSuccessfulPayment(): void {
    this.stopPolling();
    this.closePopupIfOpen();
    this.isAwaitingPayment.set(false);
    this.success.set(true);
    this.toast.success('تم الدفع بنجاح! 🎉', 'تم تفعيل اشتراكك في الباقة بنجاح عبر Paymob.');
    this.coursesService.loadCourses();
  }

  private closePopupIfOpen(): void {
    if (this.popupRef && !this.popupRef.closed) {
      try {
        this.popupRef.close();
      } catch (e) {
        console.warn('Could not close popup window reference', e);
      }
      this.popupRef = null;
    }
  }

  onCancelAwaiting(): void {
    this.closePopupIfOpen();
    this.isAwaitingPayment.set(false);
    this.stopPolling();
  }

  onGoToCourses(): void {
    this.router.navigate(['/student/courses']);
  }

  private stopPolling(): void {
    if (this.pollingSubscription) {
      clearInterval(this.pollingSubscription);
      this.pollingSubscription = undefined;
    }
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = undefined;
    }
  }
}
