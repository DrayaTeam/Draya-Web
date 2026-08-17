import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface PlanPricing {
  id: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
}

@Component({
  selector: 'draya-checkout',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class CheckoutComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly plansMap: Record<string, PlanPricing> = {
    basic: { id: 'basic', name: 'الأساسي (مبتدئ)', priceMonthly: 149, priceAnnual: 119 },
    starter: { id: 'basic', name: 'الأساسي (مبتدئ)', priceMonthly: 149, priceAnnual: 119 },
    pro: { id: 'pro', name: 'المحترف (الأكثر طلباً)', priceMonthly: 499, priceAnnual: 399 },
    professional: {
      id: 'pro',
      name: 'المحترف (الأكثر طلباً)',
      priceMonthly: 499,
      priceAnnual: 399,
    },
    enterprise: { id: 'enterprise', name: 'المؤسسات الكبرى', priceMonthly: 1299, priceAnnual: 999 },
  };

  readonly selectedPlanId = signal<string>('pro');
  readonly billingCycle = signal<'monthly' | 'annual'>('monthly');
  readonly paymentMethod = signal<'card' | 'wallet'>('card');

  // Form Fields
  readonly cardHolderName = signal<string>('');
  readonly cardNumber = signal<string>('');
  readonly cardExpiry = signal<string>('');
  readonly cardCvv = signal<string>('');
  readonly walletPhone = signal<string>('');

  // Promo Code
  readonly promoCodeInput = signal<string>('');
  readonly appliedPromo = signal<string | null>(null);
  readonly promoError = signal<string | null>(null);
  readonly promoSuccess = signal<string | null>(null);

  // Submission State
  readonly isSubmitting = signal<boolean>(false);
  readonly isSuccess = signal<boolean>(false);

  readonly currentPlan = computed(() => {
    const id = this.selectedPlanId();
    return this.plansMap[id] || this.plansMap['pro'];
  });

  readonly isAnnual = computed(() => this.billingCycle() === 'annual');

  readonly basePrice = computed(() => {
    const plan = this.currentPlan();
    if (this.isAnnual()) {
      return plan.priceAnnual * 12;
    }
    return plan.priceMonthly;
  });

  readonly discountAmount = computed(() => {
    if (this.appliedPromo()) {
      return Math.round(this.basePrice() * 0.2); // 20% discount
    }
    return 0;
  });

  readonly finalTotalPrice = computed(() => {
    return Math.max(0, this.basePrice() - this.discountAmount());
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const plan = params.get('plan');
      const billing = params.get('billing');

      if (plan && this.plansMap[plan]) {
        this.selectedPlanId.set(this.plansMap[plan].id);
      }
      if (billing === 'annual' || billing === 'monthly') {
        this.billingCycle.set(billing);
      }
    });
  }

  setPaymentMethod(method: 'card' | 'wallet'): void {
    this.paymentMethod.set(method);
  }

  applyCoupon(): void {
    const code = this.promoCodeInput().trim().toUpperCase();
    this.promoError.set(null);
    this.promoSuccess.set(null);

    if (!code) {
      this.promoError.set('يرجى كتابة رمز الكوبون أولاً');
      return;
    }

    if (code === 'DRAYA20' || code === 'DRAYA' || code === 'SAVE20') {
      this.appliedPromo.set(code);
      this.promoSuccess.set('تم تطبيق كود الخصم بنجاح (خصم 20%) 🎉');
    } else {
      this.promoError.set('كود الخصم غير صالح أو منتهي الصلاحية');
    }
  }

  removeCoupon(): void {
    this.appliedPromo.set(null);
    this.promoSuccess.set(null);
    this.promoError.set(null);
    this.promoCodeInput.set('');
  }

  async handlePaymentSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.isSubmitting.set(true);

    // Simulate payment gateway processing
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.isSuccess.set(true);

      // Auto redirect to student dashboard after brief celebratory feedback
      setTimeout(() => {
        this.router.navigate(['/student/dashboard']);
      }, 2500);
    }, 1500);
  }
}
