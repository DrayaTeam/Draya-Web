// src/app/features/plans/plan-detail/components/plan-features-matrix/plan-features-matrix.component.ts
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

@Component({
  selector: 'draya-plan-features-matrix',
  standalone: true,
  imports: [],
  templateUrl: './plan-features-matrix.component.html',
  styleUrl: './plan-features-matrix.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PlanFeaturesMatrixComponent {
  readonly planId = input<string>('pro');
  readonly planName = input.required<string>();
  readonly features = input.required<readonly string[]>();
  readonly unavailable = input.required<readonly string[]>();

  readonly theme = computed(() => {
    const id = this.planId();
    if (id === 'enterprise') {
      return {
        checkBg: 'bg-purple-100 text-purple-700',
        cardBorder: 'border-purple-200/80',
        headerIconColor: 'text-purple-600',
      };
    }
    if (id === 'basic') {
      return {
        checkBg: 'bg-sky-100 text-sky-700',
        cardBorder: 'border-sky-200/80',
        headerIconColor: 'text-sky-600',
      };
    }
    return {
      checkBg: 'bg-teal-100 text-teal-700',
      cardBorder: 'border-teal-200/80',
      headerIconColor: 'text-teal-600',
    };
  });
}
