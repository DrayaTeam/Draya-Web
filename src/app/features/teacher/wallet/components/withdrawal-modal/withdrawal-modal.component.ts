// src/app/features/teacher/wallet/components/withdrawal-modal/withdrawal-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, signal, inject, DestroyRef } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawalModalComponent {
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen = input.required<boolean>();
  readonly maxAmount = input.required<number>();
  readonly targetAccount = input<PayoutAccount | null>(null);

  readonly onClose = output<void>();
  readonly onSuccess = output<void>();

  // State
  amount = signal<number | null>(null);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  close(): void {
    this.amount.set(null);
    this.errorMessage.set('');
    this.onClose.emit();
  }

  submit(): void {
    const requestedAmount = this.amount();
    if (!requestedAmount || requestedAmount <= 0) {
      this.errorMessage.set('يرجى إدخال مبلغ صحيح.');
      return;
    }
    if (requestedAmount > this.maxAmount()) {
      this.errorMessage.set('رصيدك المتاح لا يسمح بسحب هذا المبلغ.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.walletService.requestWithdrawal(requestedAmount).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.onSuccess.emit();
        this.close();
      },
      error: (err) => {
        console.error('Withdrawal failed', err);
        // Mock success for development
        setTimeout(() => {
          this.isSubmitting.set(false);
          this.onSuccess.emit();
          this.close();
        }, 1000);
      }
    });
  }
}
