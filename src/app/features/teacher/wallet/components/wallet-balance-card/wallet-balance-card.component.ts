// src/app/features/teacher/wallet/components/wallet-balance-card/wallet-balance-card.component.ts
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { WalletBalance } from '../../../../../core/models/wallet.model';

@Component({
  selector: 'draya-wallet-balance-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './wallet-balance-card.component.html',
  styleUrl: './wallet-balance-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class WalletBalanceCardComponent {
  readonly balance = input.required<WalletBalance | null>();

  // Events for buttons
  readonly topUp = output<void>();
  readonly withdraw = output<void>();

  /** True when purchased (AI) balance is zero — shows a warning */
  readonly isLowAiBalance = computed(() => (this.balance()?.purchasedBalance ?? 0) <= 0);
}
