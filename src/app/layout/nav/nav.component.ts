// src/app/layout/nav/nav.component.ts
// Purpose: RTL-aware sidebar navigation component for the Draya shell.
// Uses Tailwind logical properties (ps-/pe- for padding, border-e for the divider)
// so it renders correctly in both Arabic (RTL) and English (LTR) without any CSS changes.
// Eventually: will render role-specific nav items based on AuthService.currentUser().role.

import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../features/auth/services/auth.service';
import { LocaleService } from '../../core/locale/locale.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './nav.component.html',
})
export class NavComponent {
  protected readonly auth = inject(AuthService);
  protected readonly localeService = inject(LocaleService);
  private readonly router = inject(Router);

  onLogout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']) // Fallback just in case
    });
  }
}
