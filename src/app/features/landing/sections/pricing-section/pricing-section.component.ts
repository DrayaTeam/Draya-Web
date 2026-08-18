import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'draya-pricing-section',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './pricing-section.component.html',
  styleUrl: './pricing-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PricingSectionComponent {
  readonly pillars = [
    {
      titleKey: 'LANDING.PRICING.PILLARS.ZERO_FEES_TITLE',
      descKey: 'LANDING.PRICING.PILLARS.ZERO_FEES_DESC',
      iconClass: 'pi pi-shield',
      accentColor: 'teal',
    },
    {
      titleKey: 'LANDING.PRICING.PILLARS.PERCENT_TITLE',
      descKey: 'LANDING.PRICING.PILLARS.PERCENT_DESC',
      iconClass: 'pi pi-percentage',
      accentColor: 'emerald',
    },
    {
      titleKey: 'LANDING.PRICING.PILLARS.AI_TITLE',
      descKey: 'LANDING.PRICING.PILLARS.AI_DESC',
      iconClass: 'pi pi-sparkles',
      accentColor: 'amber',
    },
  ];
}
