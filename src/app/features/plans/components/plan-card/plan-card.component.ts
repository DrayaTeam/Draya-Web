// src/app/features/plans/components/plan-card/plan-card.component.ts
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { PlanCardItem } from '../../models/plan-card.model';

@Component({
  selector: 'draya-plan-card',
  standalone: true,
  imports: [],
  templateUrl: './plan-card.component.html',
  styleUrl: './plan-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class PlanCardComponent {
  readonly plan = input.required<PlanCardItem>();
  readonly billingAnnual = input<boolean>(false);

  readonly planSelected = output<{ planId: string }>();
  readonly planDetailSelected = output<{ planId: string }>();

  readonly isNumericPrice = computed(() => {
    const p = this.billingAnnual() ? this.plan().priceAnnual : this.plan().priceMonthly;
    return typeof p === 'number' || (!isNaN(Number(p)) && p !== '');
  });

  readonly priceSubText = computed(() => {
    const val = this.billingAnnual() ? this.plan().priceAnnual : this.plan().priceMonthly;
    if (val === 'مجاني' || this.plan().isFree) {
      return 'مجاناً للأبد بدون رسوم';
    }
    if (val === 'مخصَّص' || this.plan().isCustom) {
      return 'تواصل مع فريق المبيعات للحصول على عرض';
    }
    if (this.billingAnnual()) {
      const p = Number(val);
      if (!isNaN(p) && p > 0) {
        return `يُدفع ${p * 12} جنيه سنوياً (توفير 20%)`;
      }
    }
    return 'يُدفع شهرياً بشكل مرن';
  });

  onSelect(event: Event): void {
    event.stopPropagation();
    this.planSelected.emit({ planId: this.plan().id });
  }

  onDetail(event: Event): void {
    event.stopPropagation();
    this.planDetailSelected.emit({ planId: this.plan().id });
  }
}
