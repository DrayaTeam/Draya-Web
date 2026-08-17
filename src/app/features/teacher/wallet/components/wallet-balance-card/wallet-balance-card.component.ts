// src/app/features/teacher/wallet/components/wallet-balance-card/wallet-balance-card.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletBalance } from '../../../../../core/models/wallet.model';

@Component({
  selector: 'draya-wallet-balance-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wallet-balance-card.component.html',
  styleUrl: './wallet-balance-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class WalletBalanceCardComponent {
  readonly balance = input.required<WalletBalance | null>();

  // Events for buttons that will be implemented in future phases
  readonly topUp = output<void>();
  readonly withdraw = output<void>();
}
