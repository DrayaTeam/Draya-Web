import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

interface Plan {
  nameKey: string;
  priceMonthlyKey: string;
  priceAnnualKey: string;
  subKey: string;
  ctaKey: string;
  featureKeys: string[];
  isFeatured: boolean;
  isGradientBg: boolean;
  badgeKey?: string;
  slug: string;
}

@Component({
  selector: 'draya-pricing-section',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './pricing-section.component.html',
  styleUrl: './pricing-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingSectionComponent {
  readonly billingAnnual = signal(false);

  readonly plans: Plan[] = [
    {
      nameKey: 'LANDING.PRICING.BASIC.NAME',
      priceMonthlyKey: 'LANDING.PRICING.BASIC.PRICE_MONTHLY',
      priceAnnualKey: 'LANDING.PRICING.BASIC.PRICE_ANNUAL',
      subKey: 'LANDING.PRICING.BASIC.SUB',
      ctaKey: 'LANDING.PRICING.BASIC.CTA',
      featureKeys: [
        'LANDING.PRICING.BASIC.F1',
        'LANDING.PRICING.BASIC.F2',
        'LANDING.PRICING.BASIC.F3',
        'LANDING.PRICING.BASIC.F4',
      ],
      isFeatured: false,
      isGradientBg: false,
      slug: 'basic',
    },
    {
      nameKey: 'LANDING.PRICING.PRO.NAME',
      priceMonthlyKey: 'LANDING.PRICING.PRO.PRICE_MONTHLY',
      priceAnnualKey: 'LANDING.PRICING.PRO.PRICE_ANNUAL',
      subKey: 'LANDING.PRICING.PRO.SUB',
      ctaKey: 'LANDING.PRICING.PRO.CTA',
      featureKeys: [
        'LANDING.PRICING.PRO.F1',
        'LANDING.PRICING.PRO.F2',
        'LANDING.PRICING.PRO.F3',
        'LANDING.PRICING.PRO.F4',
        'LANDING.PRICING.PRO.F5',
        'LANDING.PRICING.PRO.F6',
      ],
      isFeatured: true,
      isGradientBg: false,
      slug: 'pro',
    },
    {
      nameKey: 'LANDING.PRICING.ENTERPRISE.NAME',
      priceMonthlyKey: 'LANDING.PRICING.ENTERPRISE.PRICE_MONTHLY',
      priceAnnualKey: 'LANDING.PRICING.ENTERPRISE.PRICE_ANNUAL',
      subKey: 'LANDING.PRICING.ENTERPRISE.SUB',
      ctaKey: 'LANDING.PRICING.ENTERPRISE.CTA',
      badgeKey: 'LANDING.PRICING.ENTERPRISE.BADGE',
      featureKeys: [
        'LANDING.PRICING.ENTERPRISE.F1',
        'LANDING.PRICING.ENTERPRISE.F2',
        'LANDING.PRICING.ENTERPRISE.F3',
        'LANDING.PRICING.ENTERPRISE.F4',
      ],
      isFeatured: false,
      isGradientBg: true,
      slug: 'enterprise',
    },
  ];
}
