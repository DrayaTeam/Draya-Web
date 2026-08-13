// src/app/features/plans/plan-detail/components/plan-detail-hero/plan-detail-hero.component.ts
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlanDetailData } from '../../../models/plan-detail.model';

import { LogoComponent } from '../../../../../shared/components/logo/logo.component';

@Component({
  selector: 'draya-plan-detail-hero',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  templateUrl: './plan-detail-hero.component.html',
  styleUrl: './plan-detail-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PlanDetailHeroComponent {
  readonly plan = input.required<PlanDetailData>();
  readonly checkout = output<void>();

  readonly theme = computed(() => {
    const id = this.plan().id;
    if (id === 'enterprise') {
      return {
        containerClass:
          'bg-gradient-to-br from-[#120326] via-[#2a0e50] to-[#0d021d] text-white border-b border-purple-900/40',
        orb1Class: 'bg-purple-600/30',
        orb2Class: 'bg-amber-500/20',
        badgeClass: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
        priceColorClass: 'text-amber-400',
        ctaBtnClass:
          'bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 shadow-amber-500/20',
        targetBoxClass: 'bg-purple-950/70 border-purple-400/30 text-purple-100',
        targetHeaderClass: 'text-amber-300',
      };
    }
    if (id === 'basic') {
      return {
        containerClass:
          'bg-gradient-to-br from-[#051d30] via-[#0a385c] to-[#031524] text-white border-b border-sky-900/40',
        orb1Class: 'bg-sky-500/30',
        orb2Class: 'bg-teal-500/20',
        badgeClass: 'border-sky-400/40 bg-sky-400/10 text-sky-200',
        priceColorClass: 'text-sky-300',
        ctaBtnClass:
          'bg-gradient-to-r from-sky-400 to-teal-300 hover:from-sky-300 hover:to-teal-200 text-slate-950 shadow-sky-500/20',
        targetBoxClass: 'bg-sky-950/70 border-sky-400/30 text-sky-100',
        targetHeaderClass: 'text-sky-300',
      };
    }
    return {
      containerClass:
        'bg-gradient-to-br from-[#062421] via-[#0F4F49] to-[#041715] text-white border-b border-teal-900/40',
      orb1Class: 'bg-teal-500/30',
      orb2Class: 'bg-emerald-500/20',
      badgeClass: 'border-teal-400/40 bg-teal-400/10 text-teal-200',
      priceColorClass: 'text-amber-400',
      ctaBtnClass:
        'bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 shadow-amber-500/20',
      targetBoxClass: 'bg-teal-950/70 border-teal-400/30 text-teal-100',
      targetHeaderClass: 'text-amber-300',
    };
  });

  onCheckout(): void {
    this.checkout.emit();
  }
}
