// src/app/features/teacher/wallet/components/withdrawal-modal/withdrawal-modal.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WalletService } from '../../../services/wallet.service';
import { PayoutAccount } from '../../../../../core/models/wallet.model';

@Component({
  selector: 'draya-withdrawal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './withdrawal-modal.component.html',
  styleUrl: './withdrawal-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WithdrawalModalComponent {
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen = input.required<boolean>();
  readonly maxAmount = input.required<number>();
  readonly targetAccount = input<PayoutAccount | null>(null);

  readonly closed = output<void>();
  readonly success = output<void>();

  // State
  amount = signal<number | null>(null);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  close(): void {
    this.amount.set(null);
    this.errorMessage.set('');
    this.closed.emit();
  }

  submit(): void {
    const val = this.amount();
    if (!val || val <= 0) {
      this.errorMessage.set('يرجى إدخال مبلغ صالح.');
      return;
    }

    if (val > this.maxAmount()) {
      this.errorMessage.set('المبلغ المطلوب أكبر من الرصيد المتاح.');
      return;
    }

    const account = this.targetAccount();
    if (!account) {
      this.errorMessage.set('يرجى تحديد حساب السحب.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.walletService
      .requestWithdrawal(val)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.success.emit();
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.message || 'فشل تقديم طلب السحب.');
        },
      });
  }
}
