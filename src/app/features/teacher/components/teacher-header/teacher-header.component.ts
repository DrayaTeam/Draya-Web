// src/app/features/teacher/components/teacher-header/teacher-header.component.ts
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { SubscriptionService } from '../../../../core/services/subscription.service';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

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
