// src/app/features/plans/plan-detail/components/plan-testimonial/plan-testimonial.component.ts
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { PlanQuote } from '../../../models/plan-detail.model';

@Component({
  selector: 'draya-plan-testimonial',
  standalone: true,
  imports: [],
  templateUrl: './plan-testimonial.component.html',
  styleUrl: './plan-testimonial.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PlanTestimonialComponent {
  readonly planId = input<string>('pro');
  readonly quote = input.required<PlanQuote>();
  readonly checkout = output<void>();

  readonly theme = computed(() => {
    const id = this.planId();
    if (id === 'enterprise') {
      return {
        bgGradient:
          'bg-gradient-to-r from-[#240c47] via-[#4c1d95] to-[#1e1b4b] border border-purple-400/30',
        btnClass:
          'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 hover:from-amber-300 hover:to-amber-200 shadow-amber-500/20',
        authorBadgeClass: 'text-amber-300',
      };
    }
    if (id === 'basic') {
      return {
        bgGradient:
          'bg-gradient-to-r from-[#051d30] via-[#0a385c] to-[#032540] border border-sky-400/30',
        btnClass:
          'bg-gradient-to-r from-sky-400 to-teal-300 text-slate-950 hover:from-sky-300 hover:to-teal-200 shadow-sky-500/20',
        authorBadgeClass: 'text-sky-300',
      };
    }
    return {
      bgGradient:
        'bg-gradient-to-r from-[#062421] via-[#0F4F49] to-[#0f3d38] border border-teal-400/30',
      btnClass:
        'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 hover:from-amber-300 hover:to-amber-200 shadow-amber-500/20',
      authorBadgeClass: 'text-amber-300',
    };
  });

  onCheckout(): void {
    this.checkout.emit();
  }
}
