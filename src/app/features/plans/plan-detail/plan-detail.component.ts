// src/app/features/plans/plan-detail/plan-detail.component.ts
import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PLAN_DETAILS_DATA } from '../data/plan-details.data';
import { PlanDetailHeroComponent } from './components/plan-detail-hero/plan-detail-hero.component';
import { PlanFeaturesMatrixComponent } from './components/plan-features-matrix/plan-features-matrix.component';
import { PlanTestimonialComponent } from './components/plan-testimonial/plan-testimonial.component';
import { PlanFaqComponent } from './components/plan-faq/plan-faq.component';
import { PlanDetailFooterComponent } from './components/plan-detail-footer/plan-detail-footer.component';
import { EnterpriseContactComponent } from './components/enterprise-contact/enterprise-contact.component';

import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'draya-plan-detail',
  standalone: true,
  imports: [
    PlanDetailHeroComponent,
    PlanFeaturesMatrixComponent,
    PlanTestimonialComponent,
    PlanFaqComponent,
    PlanDetailFooterComponent,
    EnterpriseContactComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './plan-detail.component.html',
  styleUrl: './plan-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PlanDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isLoading = signal<boolean>(true);
  private readonly plansData = PLAN_DETAILS_DATA;
  readonly currentPlanId = signal<string>('pro');

  readonly plan = computed(() => {
    const id = this.currentPlanId();
    return this.plansData[id] || this.plansData['pro'];
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.isLoading.set(true);
      const planId = params.get('planId');
      if (planId && this.plansData[planId]) {
        this.currentPlanId.set(planId);
      } else {
        this.currentPlanId.set('pro');
      }
      setTimeout(() => {
        this.isLoading.set(false);
      }, 250);
    });
  }

  proceedToCheckout(): void {
    const planId = this.currentPlanId();
    this.router.navigate(['/checkout'], {
      queryParams: { plan: planId },
    });
  }
}
