// src/app/features/teacher/wallet/components/withdrawal-modal/withdrawal-modal.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  DestroyRef,
  effect,
  computed,
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
  
  // Accounts State
  accounts = signal<PayoutAccount[]>([]);
  isLoadingAccounts = signal<boolean>(false);
  selectedAccountId = signal<string | null>(null);

  // The effectively chosen account
  activeAccount = computed(() => {
    if (this.targetAccount()) return this.targetAccount();
    if (this.selectedAccountId()) {
      return this.accounts().find(a => a.id === this.selectedAccountId()) || null;
    }
    return this.accounts().find(a => a.isDefault) || this.accounts()[0] || null;
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.loadAccounts();
        this.amount.set(null);
        this.errorMessage.set('');
        this.selectedAccountId.set(null);
      }
    }, { allowSignalWrites: true });
  }

  loadAccounts(): void {
    if (this.targetAccount()) return; // No need to load if parent passed one
    
    this.isLoadingAccounts.set(true);
    this.walletService.getPayoutAccounts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.accounts.set(data);
          this.isLoadingAccounts.set(false);
        },
        error: () => {
          this.isLoadingAccounts.set(false);
          // Just fail silently for now, activeAccount will be null
        }
      });
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    const val = this.amount();
    if (!val || val <= 0) {
      this.errorMessage.set('يرجى إدخال مبلغ صالح.');
      return;
    }

    if (val > this.maxAmount()) {
      this.errorMessage.set('المبلغ المطلوب أكبر من رصيدك المتاح.');
      return;
    }

    const account = this.activeAccount();
    if (!account) {
      this.errorMessage.set('يرجى تحديد حساب السحب أو إضافة حساب جديد أولاً.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.walletService
      .requestWithdrawal(val, account.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.success.emit();
          this.close();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.message || 'حدث خطأ أثناء طلب السحب.');
        },
      });
  }
}
