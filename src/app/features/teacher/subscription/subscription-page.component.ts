// src/app/features/teacher/subscription/subscription-page.component.ts
import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { ToastService } from '../../../core/services/toast.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

interface UsageHistoryItem {
  month: string;
  students: number;
  storage: number;
  percentage: number;
}

@Component({
  selector: 'draya-subscription-page',
  standalone: true,
  imports: [TranslatePipe, SkeletonLoaderComponent],
  templateUrl: './subscription-page.component.html',
  styleUrl: './subscription-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class SubscriptionPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly subscriptionService = inject(SubscriptionService);

  readonly isLoading = signal<boolean>(true);
  readonly showCompareModal = signal<boolean>(false);
  readonly isCancelling = signal<boolean>(false);
  readonly actionNotification = signal<string | null>(null);

  readonly plan = this.subscriptionService.plan;
  readonly quotas = this.subscriptionService.quotas;
  readonly isNearLimit = this.subscriptionService.isNearLimit;
  readonly isAtLimit = this.subscriptionService.isAtLimit;

  ngOnInit(): void {
    this.subscriptionService.loadSubscriptionData().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false),
    });
  }

  // Usage Growth History
  readonly usageHistory = signal<UsageHistoryItem[]>([
    { month: 'فبراير', students: 120, storage: 2.1, percentage: 32 },
    { month: 'مارس', students: 210, storage: 4.5, percentage: 55 },
    { month: 'أبريل', students: 330, storage: 6.2, percentage: 77 },
    { month: 'مايو (الحالي)', students: 410, storage: 8.2, percentage: 100 },
  ]);

  openCompareModal(): void {
    this.showCompareModal.set(true);
  }

  closeCompareModal(): void {
    this.showCompareModal.set(false);
  }

  handleUpdatePayment(): void {
    this.toast.info(
      'تحديث وسيلة الدفع',
      'جارٍ الانتقال لصفحة إضافة بطاقة الدفع الكترونية جديدة...',
    );
    this.router.navigate(['/checkout'], {
      queryParams: { plan: 'pro', billing: 'annual' },
    });
  }

  handleCancelSub(): void {
    this.isCancelling.set(true);
    setTimeout(() => {
      this.isCancelling.set(false);
      this.toast.warning(
        'إلغاء التجديد التلقائي',
        'تم إيقاف التجديد التلقائي. ستظل باقتك مفعلة حتى 20 أغسطس 2026.',
      );
      this.actionNotification.set(
        'تم إيقاف التجديد التلقائي. ستظل باقتك مفعلة حتى تاريخ 20 أغسطس 2026.',
      );
      setTimeout(() => {
        this.actionNotification.set(null);
      }, 6000);
    }, 1000);
  }

  handleSimulate422Error(): void {
    this.subscriptionService.handleQuotaExceeded();
  }

  navigateToPlan(planId: string): void {
    this.closeCompareModal();
    this.router.navigate(['/plans', planId]);
  }
}
