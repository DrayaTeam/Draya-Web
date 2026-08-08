import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PricingSectionComponent } from '../landing/sections/pricing-section/pricing-section.component';

@Component({
  selector: 'draya-plans',
  standalone: true,
  imports: [PricingSectionComponent],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlansComponent {}
