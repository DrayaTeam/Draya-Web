import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SubscriptionPlan, QuotaItem } from '../../../../core/models/subscription.model';

@Component({
  selector: 'draya-subscription-widget',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './subscription-widget.component.html',
  styleUrl: './subscription-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class SubscriptionWidgetComponent {
  readonly plan = input<SubscriptionPlan | null>(null);
  readonly quotas = input<QuotaItem[]>([]);
  readonly loading = input<boolean>(false);

  readonly upgrade = output<void>();
  readonly manageBilling = output<void>();
  readonly cancelSub = output<void>();

  readonly showCompareModal = signal(false);

  readonly isNearLimit = computed(() => this.quotas().some((q) => q.isWarning || q.isDanger));

  openCompareModal(): void {
    this.showCompareModal.set(true);
  }

  closeCompareModal(): void {
    this.showCompareModal.set(false);
  }

  onManageBilling(): void {
    this.manageBilling.emit();
  }

  onCancelSub(): void {
    this.cancelSub.emit();
  }
}
