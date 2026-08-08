// src/app/features/plans/components/money-back-banner/money-back-banner.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'draya-money-back-banner',
  standalone: true,
  imports: [],
  templateUrl: './money-back-banner.component.html',
  styleUrl: './money-back-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class MoneyBackBannerComponent {}
