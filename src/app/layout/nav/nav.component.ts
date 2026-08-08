// src/app/layout/nav/nav.component.ts
// Purpose: RTL-aware sidebar navigation component for the Draya shell.
// Uses Tailwind logical properties (ps-/pe- for padding, border-e for the divider)
// so it renders correctly in both Arabic (RTL) and English (LTR) without any CSS changes.
// Eventually: will render role-specific nav items based on AuthService.currentUser().role.

import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { LocaleService } from '../../core/locale/locale.service';

import { LogoComponent } from '../../shared/components/logo/logo.component';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LogoComponent],
  templateUrl: './nav.component.html',
})
export class NavComponent {
  protected readonly auth = inject(AuthService);
  protected readonly localeService = inject(LocaleService);
}
