import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'draya-trusted-by',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './trusted-by.component.html',
  styleUrl: './trusted-by.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrustedByComponent {
  readonly academyKeys = [
    'LANDING.TRUST.A1',
    'LANDING.TRUST.A2',
    'LANDING.TRUST.A3',
    'LANDING.TRUST.A4',
  ];
}
