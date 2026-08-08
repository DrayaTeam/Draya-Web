// src/app/features/plans/components/plans-header/plans-header.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'draya-plans-header',
  standalone: true,
  imports: [LogoComponent],
  templateUrl: './plans-header.component.html',
  styleUrl: './plans-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PlansHeaderComponent {}
