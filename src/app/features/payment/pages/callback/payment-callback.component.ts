// src/app/features/payment/pages/callback/payment-callback.component.ts
import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { AuthService } from '../../../../features/auth/services/auth.service';

type PaymentStatus = 'verifying' | 'success' | 'failure';

@Component({
  selector: 'draya-payment-callback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-callback.component.html',
  styleUrl: './payment-callback.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paymentService = inject(PaymentService);
  private readonly auth = inject(AuthService);

  readonly status = signal<PaymentStatus>('verifying');
  readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    // Read query params from Paymob redirect
    this.route.queryParams.subscribe((params) => {
      // Typically Paymob sends `success=true` and an `id` (the order or transaction ID)
      const isSuccessParam = params['success'];
      const paymentId = params['id'] || params['order'];

      if (!paymentId) {
        this.status.set('failure');
        this.errorMessage.set('معرف الدفع مفقود.');
        return;
      }

      // Convert 'true'/'false' strings to boolean
      const isSuccess = isSuccessParam === 'true';

      // Call our backend to confirm and sync the transaction
      this.paymentService.confirmPayment(paymentId, isSuccess).subscribe({
        next: () => {
          if (isSuccess) {
            this.status.set('success');
          } else {
            this.status.set('failure');
            this.errorMessage.set('تم رفض العملية من قبل البنك أو بوابة الدفع.');
          }
        },
        error: (err) => {
          this.status.set('failure');
          this.errorMessage.set(err.error?.detail || 'حدث خطأ أثناء التواصل مع الخادم لتأكيد الدفع.');
        }
      });
    });
  }

  getDashboardLink(): string {
    const user = this.auth.currentUser();
    if (!user) return '/';
    
    // Return to the appropriate dashboard
    if (user.role.toLowerCase() === 'teacher') return '/teacher/wallet';
    if (user.role.toLowerCase() === 'student') return '/student/dashboard';
    return '/';
  }
}
