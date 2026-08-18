// src/app/features/student/checkout/payment-callback/student-payment-callback.component.ts

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentCoursesService } from '../../../../core/services/student-courses.service';
import { StudentEnrollmentService } from '../../../../core/services/student-enrollment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PaymentStatusDto } from '../../../../core/models/payment.model';

export type VerificationState = 'verifying' | 'completed' | 'failed';

@Component({
  selector: 'draya-student-payment-callback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-payment-callback.component.html',
  styleUrl: './student-payment-callback.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentPaymentCallbackComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly coursesService = inject(StudentCoursesService);
  private readonly enrollmentService = inject(StudentEnrollmentService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  // States: 'verifying' | 'completed' | 'failed'
  readonly verificationState = signal<VerificationState>('verifying');
  readonly isTeacher = signal<boolean>(false);
  readonly transactionId = signal<string>('');
  readonly grossAmount = signal<number>(0);
  readonly targetClassroomId = signal<string | null>(null);
  readonly countdownSeconds = signal<number>(5);
  readonly isPopup = signal<boolean>(false);
  readonly retryCount = signal<number>(0);

  private timerInterval?: ReturnType<typeof setInterval>;
  private pollInterval?: ReturnType<typeof setTimeout>;
  private readonly MAX_POLL_ATTEMPTS = 10;

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;

    // Extract transaction ID from possible query params
    const txnId =
      params['transactionId'] ||
      params['paymentTransactionId'] ||
      params['merchant_order_id'] ||
      params['special_reference'] ||
      params['id'] ||
      '';

    const typeParam = (params['type'] || params['role'] || '').toLowerCase();
    const userRole = this.authService.currentUser()?.role;
    const isTeacherUser =
      userRole === 'teacher' || typeParam.includes('teacher') || typeParam.includes('sub');

    this.isTeacher.set(isTeacherUser);
    this.transactionId.set(txnId);

    const hasOpener = typeof window !== 'undefined' && !!window.opener;
    this.isPopup.set(hasOpener);

    const urlSuccess =
      params['success'] === 'true' ||
      params['status'] === 'success' ||
      params['txn_response_code'] === 'APPROVED' ||
      params['success'] === true;

    if (txnId) {
      if (urlSuccess) {
        // 1. Synchronize & confirm transaction with backend immediately
        this.enrollmentService.confirmPayment(txnId, true).subscribe(() => {
          this.pollPaymentStatus(txnId, 1);
        });
      } else {
        this.pollPaymentStatus(txnId, 1);
      }
    } else {
      // Fallback if no transactionId is present: check URL query status
      const urlStatus = (params['status'] || params['success'] || '').toString().toLowerCase();
      if (urlStatus === 'success' || urlStatus === 'true') {
        this.markAsCompleted({
          paymentTransactionId: '',
          status: 'Completed',
          grossAmount: 0,
          isEnrolled: true,
        });
      } else {
        this.markAsFailed('لم يتم العثور على رقم المعاملة.');
      }
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
    }
  }

  private pollPaymentStatus(transactionId: string, attempt: number): void {
    this.retryCount.set(attempt);
    this.cdr.markForCheck();

    this.enrollmentService.getPaymentStatus(transactionId).subscribe({
      next: (statusDto) => {
        if (!statusDto) {
          // If 404 or null during early moments, retry up to MAX_POLL_ATTEMPTS
          if (attempt < this.MAX_POLL_ATTEMPTS) {
            this.scheduleNextPoll(transactionId, attempt + 1);
          } else {
            this.markAsFailed('تعذر التحقق من حالة المعاملة من السيرفر.');
          }
          return;
        }

        const normStatus = (statusDto.status || '').toLowerCase();

        if (normStatus === 'completed' || (normStatus === 'success' && statusDto.isEnrolled)) {
          this.markAsCompleted(statusDto);
        } else if (normStatus === 'pending') {
          if (attempt < this.MAX_POLL_ATTEMPTS) {
            this.scheduleNextPoll(transactionId, attempt + 1);
          } else {
            this.markAsFailed(
              'استغرقت معالجة الدفع وقتاً أطول من المتوقع. يرجى مراجعة إدارة الحساب.',
            );
          }
        } else {
          this.markAsFailed('فشلت عملية الدفع أو تم إلغاؤها من البنك.');
        }
      },
      error: () => {
        if (attempt < this.MAX_POLL_ATTEMPTS) {
          this.scheduleNextPoll(transactionId, attempt + 1);
        } else {
          this.markAsFailed('حدث خطأ أثناء الاتصال بسيرفر الدفع.');
        }
      },
    });
  }

  private scheduleNextPoll(transactionId: string, nextAttempt: number): void {
    this.pollInterval = setTimeout(() => {
      this.pollPaymentStatus(transactionId, nextAttempt);
    }, 3000);
  }

  private markAsCompleted(statusDto: PaymentStatusDto): void {
    this.verificationState.set('completed');
    this.grossAmount.set(statusDto.grossAmount || 0);
    this.targetClassroomId.set(statusDto.classroomId || null);
    this.cdr.markForCheck();

    const isTeacherUser = this.isTeacher();
    const successMsg = isTeacherUser
      ? 'تم تأكيد اشتراكك في باقة المعلم بنجاح!'
      : 'تم تأكيد اشتراكك في الكلاس رووم بنجاح!';
    this.toast.success('تمت العملية بنجاح', successMsg);

    if (!isTeacherUser) {
      this.coursesService.loadCourses();
    }

    if (this.isPopup()) {
      try {
        window.opener.postMessage(
          {
            type: 'PAYMOB_PAYMENT_SUCCESS',
            status: 'success',
            transactionId: statusDto.paymentTransactionId,
            classroomId: statusDto.classroomId,
          },
          '*',
        );
      } catch (e) {
        console.warn('Failed to notify opener', e);
      }

      setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          console.warn('Could not auto-close window', e);
        }
      }, 1500);
      return;
    }

    // Countdown for auto-redirect (students only, teachers choose manually)
    if (!isTeacherUser) {
      this.timerInterval = setInterval(() => {
        const current = this.countdownSeconds();
        if (current > 1) {
          this.countdownSeconds.set(current - 1);
          this.cdr.markForCheck();
        } else {
          clearInterval(this.timerInterval);
          this.navigateAfterPayment();
        }
      }, 1000);
    }
  }

  private markAsFailed(reasonMsg: string): void {
    this.verificationState.set('failed');
    this.toast.error('فشلت العملية', reasonMsg);

    if (this.isPopup()) {
      try {
        window.opener.postMessage(
          {
            type: 'PAYMOB_PAYMENT_SUCCESS',
            status: 'failed',
            transactionId: this.transactionId(),
          },
          '*',
        );
      } catch (e) {
        console.warn('Failed to notify opener', e);
      }

      setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          console.warn('Failed closing window', e);
        }
      }, 2500);
    }
    this.cdr.markForCheck();
  }

  onPrimaryAction(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.isPopup()) {
      try {
        window.close();
      } catch (e) {
        console.warn('Failed closing popup', e);
      }
    }
    this.navigateAfterPayment();
  }

  private navigateAfterPayment(): void {
    if (this.isTeacher()) {
      this.router.navigate(['/teacher/wallet']);
    } else {
      const clsId = this.targetClassroomId();
      if (clsId) {
        this.router.navigate(['/student/courses', clsId]);
      } else {
        this.router.navigate(['/student/courses']);
      }
    }
  }
}
