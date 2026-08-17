// src/app/features/plans/plan-detail/components/plan-detail-footer/plan-detail-footer.component.ts
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'draya-plan-detail-footer',
  standalone: true,
  imports: [],
  templateUrl: './plan-detail-footer.component.html',
  styleUrl: './plan-detail-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PlanDetailFooterComponent {
  readonly planId = input<string>('pro');
  readonly planName = input.required<string>();
  readonly checkout = output<void>();

  readonly theme = computed(() => {
    const id = this.planId();
    if (id === 'enterprise') {
      return {
        containerClass: 'bg-[#150727] border-purple-900/50',
        btnClass:
          'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 hover:from-amber-300 hover:to-amber-200 shadow-amber-500/20',
      };
    }
    if (id === 'basic') {
      return {
        containerClass: 'bg-[#041624] border-sky-900/50',
        btnClass:
          'bg-gradient-to-r from-sky-400 to-teal-300 text-slate-950 hover:from-sky-300 hover:to-teal-200 shadow-sky-500/20',
      };
    }
    return {
      containerClass: 'bg-slate-950 border-slate-800',
      btnClass:
        'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 hover:from-amber-300 hover:to-amber-200 shadow-amber-500/20',
    };
  });

  onCheckout(): void {
    this.checkout.emit();
  }
}
