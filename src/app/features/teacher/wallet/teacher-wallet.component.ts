// src/app/features/teacher/wallet/teacher-wallet.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  DestroyRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/services/toast.service';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);

  @ViewChild(WalletTransactionsComponent) transactionsComponent!: WalletTransactionsComponent;

  readonly balance = signal<WalletBalance | null>(null);
  readonly isLoadingBalance = signal<boolean>(true);

  // Withdrawal Modal State
  readonly isWithdrawalModalOpen = signal<boolean>(false);
  readonly selectedPayoutAccount = signal<PayoutAccount | null>(null);

  // Topup Modal State
  readonly isTopupModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.loadBalance();
    if (this.transactionsComponent) this.transactionsComponent.loadTransactions(1);
  }

  loadBalance(): void {
    if (!this.balance()) {
      this.isLoadingBalance.set(true);
    }
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
      this.toastService.warning('عفواً', 'ليس لديك رصيد متاح للسحب حالياً.');
      return;
    }
    // If they click withdraw from the main card, open modal without a specific account yet
    this.selectedPayoutAccount.set(null);
    this.isWithdrawalModalOpen.set(true);
  }

  handleWithdrawToAccount(account: PayoutAccount): void {
    if (!this.balance() || this.balance()!.availableEarnedBalance <= 0) {
      this.toastService.warning('عفواً', 'ليس لديك رصيد متاح للسحب حالياً.');
      return;
    }
    this.selectedPayoutAccount.set(account);
    this.isWithdrawalModalOpen.set(true);
  }

  onWithdrawalSuccess(): void {
    // Reload balance and transactions after successful withdrawal
    this.loadBalance();
    
    // Slight delay to allow backend CQRS/database to sync the read model
    setTimeout(() => {
      if (this.transactionsComponent) {
        this.transactionsComponent.loadTransactions(1);
      }
    }, 1500);
    
    this.toastService.success('نجاح', 'تم تقديم طلب السحب بنجاح. سيتم المراجعة من قبل الإدارة.');
  }
}
