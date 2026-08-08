import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'draya-landing-footer',
  standalone: true,
  imports: [TranslatePipe, LogoComponent],
  templateUrl: './landing-footer.component.html',
  styleUrl: './landing-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFooterComponent {}
