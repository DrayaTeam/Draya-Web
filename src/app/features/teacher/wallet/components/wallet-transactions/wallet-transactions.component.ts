// src/app/features/teacher/wallet/components/wallet-transactions/wallet-transactions.component.ts
import { Component, ChangeDetectionStrategy, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { WalletService } from '../../../services/wallet.service';
import { WalletTransaction, TransactionType, BalanceType, PaginatedResponse } from '../../../../../core/models/wallet.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'draya-wallet-transactions',
  standalone: true,
  imports: [CommonModule, TranslatePipe, DatePipe],
  templateUrl: './wallet-transactions.component.html',
  styleUrl: './wallet-transactions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' }
})
export class WalletTransactionsComponent implements OnInit {
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  readonly transactions = signal<WalletTransaction[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly hasNextPage = signal<boolean>(false);
  readonly hasPrevPage = signal<boolean>(false);

  // Enum access for template
  TransactionType = TransactionType;
  BalanceType = BalanceType;

  ngOnInit(): void {
    this.loadTransactions(1);
  }

  loadTransactions(page: number): void {
    this.isLoading.set(true);
    this.walletService.getTransactions(page).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.transactions.set(data.items);
        this.currentPage.set(data.pageNumber);
        this.totalPages.set(data.totalPages);
        this.hasNextPage.set(data.hasNextPage);
        this.hasPrevPage.set(data.hasPreviousPage);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load transactions', err);
        // Fallback mock data for UI testing
        this.transactions.set([
          {
            id: 'tx-1',
            type: TransactionType.Earned,
            amount: 150,
            balanceType: BalanceType.Earned,
            referenceId: 'order-123',
            description: 'شراء كورس الفيزياء للثانوية العامة بواسطة الطالب أحمد',
            createdAt: new Date().toISOString()
          },
          {
            id: 'tx-2',
            type: TransactionType.Withdrawal,
            amount: -500,
            balanceType: BalanceType.Earned,
            referenceId: 'wd-456',
            description: 'طلب سحب رصيد إلى حساب إنستاباي',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'tx-3',
            type: TransactionType.TopUp,
            amount: 300,
            balanceType: BalanceType.Purchased,
            referenceId: 'topup-789',
            description: 'شحن رصيد المنصة لاستخدام الذكاء الاصطناعي',
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
        this.currentPage.set(1);
        this.totalPages.set(1);
        this.isLoading.set(false);
      }
    });
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.loadTransactions(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.hasPrevPage()) {
      this.loadTransactions(this.currentPage() - 1);
    }
  }

  getTypeLabel(type: TransactionType): string {
    switch(type) {
      case TransactionType.Earned: return 'أرباح كورس';
      case TransactionType.Purchased: return 'شراء خدمة';
      case TransactionType.Withdrawal: return 'سحب أرباح';
      case TransactionType.TopUp: return 'شحن رصيد';
      case TransactionType.Refund: return 'استرداد نقدي';
      default: return 'معاملة';
    }
  }

  getTypeClass(type: TransactionType): string {
    switch(type) {
      case TransactionType.Earned: return 'badge-green';
      case TransactionType.TopUp: return 'badge-purple';
      case TransactionType.Withdrawal: return 'badge-orange';
      case TransactionType.Purchased: return 'badge-blue';
      case TransactionType.Refund: return 'badge-gray';
      default: return 'badge-gray';
    }
  }
}
