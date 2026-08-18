import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

import { ThemeService } from '../../../../core/services/theme.service';
import { LocaleService } from '../../../../core/locale/locale.service';

@Component({
  selector: 'draya-teacher-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  templateUrl: './teacher-header.component.html',
  styleUrl: './teacher-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block sticky top-0 z-50' },
})
export class TeacherHeaderComponent {
  protected readonly auth = inject(AuthService);
  protected readonly subscriptionService = inject(SubscriptionService);
  readonly themeService = inject(ThemeService);
  readonly localeService = inject(LocaleService);

  readonly userDisplayName = computed(() => {
    return this.auth.currentUser()?.fullName || 'المعلم';
  });

  readonly profilePictureUrl = computed(() => {
    const user = this.auth.currentUser();
    return user?.profilePictureUrl || user?.pictureUrl || null;
  });

  readonly userInitials = computed(() => {
    const name = this.userDisplayName().trim();
    if (!name) return 'مع';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  readonly isMobileMenuOpen = signal<boolean>(false);
  readonly isNotificationsOpen = signal<boolean>(false);

  readonly plan = this.subscriptionService.plan;
  readonly quotas = this.subscriptionService.quotas;
  readonly isNearLimit = this.subscriptionService.isNearLimit;
  readonly isAtLimit = this.subscriptionService.isAtLimit;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleNotifications(): void {
    this.isNotificationsOpen.update((v) => !v);
  }

  closeNotifications(): void {
    this.isNotificationsOpen.set(false);
  }
}
