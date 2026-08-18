import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'draya-student-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  templateUrl: './student-header.component.html',
  styleUrl: './student-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block sticky top-0 z-50' },
})
export class StudentHeaderComponent {
  protected readonly auth = inject(AuthService);

  readonly userDisplayName = computed(() => {
    return this.auth.currentUser()?.fullName || 'الطالب';
  });

  readonly userInitials = computed(() => {
    const name = this.userDisplayName().trim();
    if (!name) return 'ط';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  });

  readonly isMobileMenuOpen = signal<boolean>(false);
  readonly isNotificationsOpen = signal<boolean>(false);

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
