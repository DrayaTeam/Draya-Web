// src/app/features/student/checkout/payment-callback/student-payment-callback.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentCoursesService } from '../../../../core/services/student-courses.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

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
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly isSuccess = signal<boolean>(true);
  readonly isTeacher = signal<boolean>(false);
  readonly transactionId = signal<string>('');
  readonly countdownSeconds = signal<number>(3);
  readonly isPopup = signal<boolean>(false);

  private timerInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;

    // Check various Paymob success flags
    const successParam = params['success'];
    const statusParam = params['status'];
    const txnId =
      params['paymentTransactionId'] || params['merchant_order_id'] || params['id'] || '';
    const typeParam = (params['type'] || params['role'] || '').toLowerCase();

    const isSuccessful =
      successParam === 'true' ||
      statusParam === 'success' ||
      params['txn_response_code'] === 'APPROVED' ||
      params['data.message'] === 'Approved';

    const userRole = this.authService.currentUser()?.role;
    const isTeacherUser =
      userRole === 'teacher' || typeParam.includes('teacher') || typeParam.includes('sub');

    this.isSuccess.set(isSuccessful);
    this.isTeacher.set(isTeacherUser);
    this.transactionId.set(txnId);

    // Check if this window was opened as a popup tab from the main website
    const hasOpener = typeof window !== 'undefined' && !!window.opener;
    this.isPopup.set(hasOpener);

    if (hasOpener) {
      try {
        window.opener.postMessage(
          {
            type: 'PAYMOB_PAYMENT_SUCCESS',
            status: isSuccessful ? 'success' : 'failed',
            transactionId: txnId,
          },
          '*',
        );
      } catch (e) {
        console.error('Failed to postMessage to opener', e);
      }
    }

    if (isSuccessful) {
      const successMsg = isTeacherUser
        ? 'تم تأكيد اشتراكك في باقة المعلم بنجاح!'
        : 'تم تأكيد اشتراكك في الكلاس رووم بنجاح!';
      this.toast.success('تمت العملية بنجاح', successMsg);

      if (!isTeacherUser) {
        // Reload enrolled courses for student
        this.coursesService.loadCourses();
      }

      // If opened as a popup tab, close itself after 1.5s
      if (hasOpener) {
        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            console.warn('Could not auto-close window', e);
          }
        }, 1500);
        return;
      }

      // Auto redirect countdown for standalone window
      this.timerInterval = setInterval(() => {
        const current = this.countdownSeconds();
        if (current > 1) {
          this.countdownSeconds.set(current - 1);
        } else {
          clearInterval(this.timerInterval);
          this.navigateAfterPayment();
        }
      }, 1000);
    } else {
      this.toast.error('فشلت العملية', 'لم يتم إتمام عملية الدفع بنجاح.');
      if (hasOpener) {
        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            console.warn('Failed closing window', e);
          }
        }, 2000);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
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
      this.router.navigate(['/teacher/dashboard']);
    } else {
      this.router.navigate(['/student/courses']);
    }
  }
}
