import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'draya-landing-footer',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './landing-footer.component.html',
  styleUrl: './landing-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFooterComponent {}
