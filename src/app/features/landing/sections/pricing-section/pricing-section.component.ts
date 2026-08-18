import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

interface PricingTier {
  tagKey: string;
  nameKey: string;
  priceKey: string;
  unitKey: string;
  subKey: string;
  badgeKey?: string;
  isFeatured: boolean;
  isEnterprise: boolean;
  featureKeys: string[];
  ctaKey: string;
  ctaLink: string;
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
  readonly tiers: PricingTier[] = [
    {
      tagKey: 'LANDING.PRICING.TEACHER.TAG',
      nameKey: 'LANDING.PRICING.TEACHER.NAME',
      priceKey: 'LANDING.PRICING.TEACHER.PRICE',
      unitKey: 'LANDING.PRICING.TEACHER.UNIT',
      subKey: 'LANDING.PRICING.TEACHER.SUB',
      badgeKey: 'LANDING.PRICING.TEACHER.BADGE',
      isFeatured: true,
      isEnterprise: false,
      featureKeys: [
        'LANDING.PRICING.TEACHER.F1',
        'LANDING.PRICING.TEACHER.F2',
        'LANDING.PRICING.TEACHER.F3',
        'LANDING.PRICING.TEACHER.F4',
        'LANDING.PRICING.TEACHER.F5',
      ],
      ctaKey: 'LANDING.PRICING.TEACHER.CTA',
      ctaLink: '/auth/register-teacher',
    },
    {
      tagKey: 'LANDING.PRICING.STUDENT.TAG',
      nameKey: 'LANDING.PRICING.STUDENT.NAME',
      priceKey: 'LANDING.PRICING.STUDENT.PRICE',
      unitKey: 'LANDING.PRICING.STUDENT.UNIT',
      subKey: 'LANDING.PRICING.STUDENT.SUB',
      isFeatured: false,
      isEnterprise: false,
      featureKeys: [
        'LANDING.PRICING.STUDENT.F1',
        'LANDING.PRICING.STUDENT.F2',
        'LANDING.PRICING.STUDENT.F3',
        'LANDING.PRICING.STUDENT.F4',
        'LANDING.PRICING.STUDENT.F5',
      ],
      ctaKey: 'LANDING.PRICING.STUDENT.CTA',
      ctaLink: '/auth/register-student',
    },
    {
      tagKey: 'LANDING.PRICING.ENTERPRISE.TAG',
      nameKey: 'LANDING.PRICING.ENTERPRISE.NAME',
      priceKey: 'LANDING.PRICING.ENTERPRISE.PRICE',
      unitKey: 'LANDING.PRICING.ENTERPRISE.UNIT',
      subKey: 'LANDING.PRICING.ENTERPRISE.SUB',
      badgeKey: 'LANDING.PRICING.ENTERPRISE.BADGE',
      isFeatured: false,
      isEnterprise: true,
      featureKeys: [
        'LANDING.PRICING.ENTERPRISE.F1',
        'LANDING.PRICING.ENTERPRISE.F2',
        'LANDING.PRICING.ENTERPRISE.F3',
        'LANDING.PRICING.ENTERPRISE.F4',
        'LANDING.PRICING.ENTERPRISE.F5',
      ],
      ctaKey: 'LANDING.PRICING.ENTERPRISE.CTA',
      ctaLink: '/auth/register-teacher',
    },
  ];
}
