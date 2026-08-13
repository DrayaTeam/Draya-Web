import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

interface Benefit {
  num: string;
  labelKey: string;
  descKey: string;
  type: 'brain' | 'shield' | 'chart' | 'book' | 'star' | 'grad';
}

@Component({
  selector: 'draya-why-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './why-section.component.html',
  styleUrl: './why-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhySectionComponent {
  readonly benefits: Benefit[] = [
    {
      num: '01',
      labelKey: 'LANDING.BENEFITS.B1_LABEL',
      descKey: 'LANDING.BENEFITS.B1_DESC',
      type: 'brain',
    },
    {
      num: '02',
      labelKey: 'LANDING.BENEFITS.B2_LABEL',
      descKey: 'LANDING.BENEFITS.B2_DESC',
      type: 'shield',
    },
    {
      num: '03',
      labelKey: 'LANDING.BENEFITS.B3_LABEL',
      descKey: 'LANDING.BENEFITS.B3_DESC',
      type: 'chart',
    },
    {
      num: '04',
      labelKey: 'LANDING.BENEFITS.B4_LABEL',
      descKey: 'LANDING.BENEFITS.B4_DESC',
      type: 'book',
    },
    {
      num: '05',
      labelKey: 'LANDING.BENEFITS.B5_LABEL',
      descKey: 'LANDING.BENEFITS.B5_DESC',
      type: 'star',
    },
    {
      num: '06',
      labelKey: 'LANDING.BENEFITS.B6_LABEL',
      descKey: 'LANDING.BENEFITS.B6_DESC',
      type: 'grad',
    },
  ];
}
