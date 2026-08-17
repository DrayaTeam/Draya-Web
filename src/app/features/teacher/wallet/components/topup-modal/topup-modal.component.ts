// src/app/features/teacher/wallet/components/topup-modal/topup-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WalletService } from '../../../services/wallet.service';

@Component({
  selector: 'draya-topup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topup-modal.component.html',
  styleUrl: './topup-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopupModalComponent {
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen = input.required<boolean>();
  readonly onClose = output<void>();

  amount = signal<number | null>(null);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Quick preset amounts
  readonly presets = [100, 300, 500, 1000];

  close(): void {
    this.amount.set(null);
    this.errorMessage.set('');
    this.onClose.emit();
  }

  setAmount(val: number): void {
    this.amount.set(val);
  }

  submit(): void {
    const requestedAmount = this.amount();
    if (!requestedAmount || requestedAmount < 50) {
      this.errorMessage.set('الحد الأدنى للشحن هو 50 ج.م.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/payment/result?type=teacher`
      : 'https://draya-lms.vercel.app/payment/result?type=teacher';

    this.walletService.topup(requestedAmount, redirectUrl).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        // Redirect to Paymob Checkout URL
        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
        } else {
          this.errorMessage.set('فشل في الحصول على رابط الدفع.');
        }
      },
      error: (err) => {
        console.error('Topup failed', err);
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.detail || 'حدث خطأ أثناء إعداد عملية الدفع.');
      }
    });
  }
}
