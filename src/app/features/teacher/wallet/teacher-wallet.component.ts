// src/app/features/teacher/wallet/teacher-wallet.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { WalletService } from '../services/wallet.service';
import { WalletBalance, PayoutAccount } from '../../../core/models/wallet.model';
import { WalletBalanceCardComponent } from './components/wallet-balance-card/wallet-balance-card.component';
import { PayoutAccountsComponent } from './components/payout-accounts/payout-accounts.component';
import { WithdrawalModalComponent } from './components/withdrawal-modal/withdrawal-modal.component';
import { TopupModalComponent } from './components/topup-modal/topup-modal.component';
import { WalletTransactionsComponent } from './components/wallet-transactions/wallet-transactions.component';

@Component({
  selector: 'draya-teacher-wallet',
  standalone: true,
  imports: [
    CommonModule,
    WalletBalanceCardComponent,
    PayoutAccountsComponent,
    WithdrawalModalComponent,
    TopupModalComponent,
    WalletTransactionsComponent,
  ],
  templateUrl: './teacher-wallet.component.html',
  styleUrl: './teacher-wallet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class TeacherWalletComponent implements OnInit {
  private readonly walletService = inject(WalletService);
  private readonly messageService = inject(MessageService, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  readonly balance = signal<WalletBalance | null>(null);
  readonly isLoadingBalance = signal<boolean>(true);

  // Withdrawal Modal State
  readonly isWithdrawalModalOpen = signal<boolean>(false);
  readonly selectedPayoutAccount = signal<PayoutAccount | null>(null);

  // Topup Modal State
  readonly isTopupModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.loadBalance();
  }

  loadBalance(): void {
    this.isLoadingBalance.set(true);
    this.walletService
      .getBalance()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.balance.set(data);
          this.isLoadingBalance.set(false);
        },
        error: (err) => {
          console.error('Failed to load wallet balance', err);
          // Fallback for development if backend isn't returning data properly yet
          this.balance.set({
            earnedBalance: 270,
            availableEarnedBalance: 270,
            purchasedBalance: 0,
          });
          this.isLoadingBalance.set(false);
        },
      });
  }

  handleTopUp(): void {
    this.isTopupModalOpen.set(true);
  }

  handleWithdraw(): void {
    if (!this.balance() || this.balance()!.availableEarnedBalance <= 0) {
      this.messageService?.add({
        severity: 'error',
        summary: 'عذراً',
        detail: 'ليس لديك رصيد أرباح متاح للسحب.',
      });
      return;
    }
    // If they click withdraw from the main card, open modal without a specific account yet
    this.selectedPayoutAccount.set(null);
    this.isWithdrawalModalOpen.set(true);
  }

  handleWithdrawToAccount(account: PayoutAccount): void {
    if (!this.balance() || this.balance()!.availableEarnedBalance <= 0) {
      this.messageService?.add({
        severity: 'error',
        summary: 'عذراً',
        detail: 'ليس لديك رصيد أرباح متاح للسحب.',
      });
      return;
    }
    this.selectedPayoutAccount.set(account);
    this.isWithdrawalModalOpen.set(true);
  }

  onWithdrawalSuccess(): void {
    // Reload balance after successful withdrawal
    this.loadBalance();
    this.messageService?.add({
      severity: 'success',
      summary: 'عملية ناجحة',
      detail: 'تم تقديم طلب السحب بنجاح. سيتم المراجعة من قبل الإدارة.',
    });
  }
}
