// src/app/features/plans/plans.component.ts
import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PLANS_COMPARISON_DATA } from './data/plans-comparison.data';
import { PlansHeaderComponent } from './components/plans-header/plans-header.component';
import { PlanCardComponent } from './components/plan-card/plan-card.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'draya-plans',
  standalone: true,
  imports: [PlansHeaderComponent, PlanCardComponent, SkeletonLoaderComponent],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PlansComponent implements OnInit {
  private readonly router = inject(Router);

  readonly isLoading = signal<boolean>(true);
  readonly billingAnnual = signal<boolean>(false);
  readonly plans = PLANS_COMPARISON_DATA;

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading.set(false);
    }, 280);
  }

  toggleBilling(annual: boolean): void {
    if (this.billingAnnual() !== annual) {
      this.billingAnnual.set(annual);
    }
  }

  onSelectPlan(planId: string): void {
    if (planId === 'enterprise') {
      this.router.navigate(['/plans/enterprise']);
      return;
    }
    const cycle = this.billingAnnual() ? 'annual' : 'monthly';
    this.router.navigate(['/checkout'], {
      queryParams: { plan: planId, billing: cycle },
    });
  }

  onNavigateToDetail(planId: string): void {
    this.router.navigate(['/plans', planId]);
  }
}
