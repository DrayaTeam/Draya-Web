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

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <!-- Sidebar: border-e (logical end border) renders on the correct side in RTL/LTR -->
    <nav class="flex h-full flex-col border-e border-border bg-sidebar">
      <!-- Logo -->
      <div class="border-b border-border px-6 py-5">
        <span class="text-xl font-bold text-primary">
          {{ 'app.name' | translate }}
        </span>
      </div>

      <!-- Nav links — ps-/pe- for logical padding -->
      <ul class="flex-1 space-y-1 p-3">
        <li>
          <a
            routerLink="/teacher/dashboard"
            routerLinkActive="bg-accent text-accent-foreground"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium
                   text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            <span class="i-pi-th-large h-4 w-4" aria-hidden="true"></span>
            {{ 'nav.dashboard' | translate }}
          </a>
        </li>
        <li>
          <a
            routerLink="/student"
            routerLinkActive="bg-accent text-accent-foreground"
            class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium
                   text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            {{ 'nav.students' | translate }}
          </a>
        </li>
      </ul>

      <!-- Footer: logout + locale toggle -->
      <div class="border-t border-border p-4 space-y-2">
        <button
          (click)="localeService.toggle()"
          class="w-full rounded-md px-3 py-2 text-start text-sm text-muted-foreground
                 hover:bg-accent hover:text-accent-foreground">
          {{ localeService.locale() === 'ar' ? 'English' : 'عربي' }}
        </button>
        <button
          (click)="auth.logout()"
          class="w-full rounded-md px-3 py-2 text-start text-sm text-muted-foreground
                 hover:bg-accent hover:text-accent-foreground">
          {{ 'auth.logout' | translate }}
        </button>
      </div>
    </nav>
  `,
})
export class NavComponent {
  protected readonly auth = inject(AuthService);
  protected readonly localeService = inject(LocaleService);
}
