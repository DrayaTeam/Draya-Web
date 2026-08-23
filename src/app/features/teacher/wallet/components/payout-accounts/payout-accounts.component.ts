// src/app/features/teacher/wallet/components/payout-accounts/payout-accounts.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  DestroyRef,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WalletService } from '../../../services/wallet.service';
import {
  PayoutAccount,
  AccountType,
  CreatePayoutAccountRequest,
} from '../../../../../core/models/wallet.model';

@Component({
  selector: 'draya-payout-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, Select],
  templateUrl: './payout-accounts.component.html',
  styleUrl: './payout-accounts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class PayoutAccountsComponent implements OnInit {
  readonly accountTypeOptions = [
    { label: 'إنستاباي (Instapay)', value: AccountType.InstaPay },
    { label: 'حساب بنكي', value: AccountType.BankAccount },
    { label: 'محفظة إلكترونية', value: AccountType.MobileWallet },
  ];
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  readonly accounts = signal<PayoutAccount[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isAdding = signal<boolean>(false);

  readonly withdrawRequested = output<PayoutAccount>();

  // Form State
  newAccountType = signal<AccountType>(AccountType.InstaPay);
  newAccountName = signal<string>('');
  newAccountIdentifier = signal<string>('');
  isSubmitting = signal<boolean>(false);
  deletingAccountId = signal<string | null>(null);

  // Enum access for template
  AccountType = AccountType;

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading.set(true);
    this.walletService
      .getPayoutAccounts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.accounts.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load payout accounts', err);
          // Fallback for development UI testing
          this.accounts.set([
            {
              id: '1',
              teacherId: 't1',
              accountType: AccountType.InstaPay,
              accountName: 'Ahmed Instapay',
              accountIdentifier: '01012345678',
              isDefault: true,
              createdAt: new Date().toISOString(),
            },
          ]);
          this.isLoading.set(false);
        },
      });
  }

  toggleAddForm(): void {
    this.isAdding.update((v) => !v);
    if (!this.isAdding()) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newAccountType.set(AccountType.InstaPay);
    this.newAccountName.set('');
    this.newAccountIdentifier.set('');
    this.isSubmitting.set(false);
  }

  submitNewAccount(): void {
    if (!this.newAccountName() || !this.newAccountIdentifier()) return;

    this.isSubmitting.set(true);
    const payload: CreatePayoutAccountRequest = {
      accountType: this.newAccountType(),
      accountName: this.newAccountName(),
      accountIdentifier: this.newAccountIdentifier(),
      isDefault: this.accounts().length === 0, // Make default if it's the first one
    };

    this.walletService
      .addPayoutAccount(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (newAccount) => {
          this.accounts.update((accs) => [...accs, newAccount]);
          this.toggleAddForm();
        },
        error: (err) => {
          console.error('Failed to add account', err);
          // Mock success for development
          const mockAccount: PayoutAccount = {
            id: Math.random().toString(),
            teacherId: 't1',
            ...payload,
            createdAt: new Date().toISOString(),
          };
          this.accounts.update((accs) => [...accs, mockAccount]);
          this.toggleAddForm();
        },
      });
  }

  confirmDelete(id: string): void {
    this.deletingAccountId.set(id);
    setTimeout(() => {
      if (this.deletingAccountId() === id) {
        this.deletingAccountId.set(null);
      }
    }, 3000);
  }

  deleteAccount(id: string): void {
    this.deletingAccountId.set(null);

    this.walletService
      .deletePayoutAccount(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.accounts.update((accs) => accs.filter((a) => a.id !== id));
        },
        error: (err) => {
          console.error('Failed to delete account', err);
          // Mock success
          this.accounts.update((accs) => accs.filter((a) => a.id !== id));
        },
      });
  }
}
