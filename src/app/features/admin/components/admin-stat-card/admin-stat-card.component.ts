import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'draya-admin-stat-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './admin-stat-card.component.html',
  styleUrls: ['./admin-stat-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStatCardComponent {
  value = input.required<string | number>();
  labelKey = input.required<string>();
  iconClass = input.required<string>();
  variant = input<'violet' | 'emerald' | 'blue' | 'amber' | 'teal'>('teal');
  trendPercent = input<number>();
  currencySuffix = input<string>();
}
