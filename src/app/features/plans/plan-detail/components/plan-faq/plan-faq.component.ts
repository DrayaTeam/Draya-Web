// src/app/features/plans/plan-detail/components/plan-faq/plan-faq.component.ts
import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';
import { PlanFaq } from '../../../models/plan-detail.model';

@Component({
  selector: 'draya-plan-faq',
  standalone: true,
  imports: [],
  templateUrl: './plan-faq.component.html',
  styleUrl: './plan-faq.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PlanFaqComponent {
  readonly planId = input<string>('pro');
  readonly planName = input.required<string>();
  readonly faqs = input.required<readonly PlanFaq[]>();

  readonly openFaqIndex = signal<number | null>(0);

  readonly theme = computed(() => {
    const id = this.planId();
    if (id === 'enterprise') {
      return {
        activeChevron: 'text-purple-600',
        activeCardBorder: 'border-purple-300 ring-2 ring-purple-500/10 shadow-md',
      };
    }
    if (id === 'basic') {
      return {
        activeChevron: 'text-sky-600',
        activeCardBorder: 'border-sky-300 ring-2 ring-sky-500/10 shadow-md',
      };
    }
    return {
      activeChevron: 'text-[#0F4F49]',
      activeCardBorder: 'border-teal-300 ring-2 ring-teal-500/10 shadow-md',
    };
  });

  toggleFaq(index: number): void {
    this.openFaqIndex.update((current) => (current === index ? null : index));
  }
}
