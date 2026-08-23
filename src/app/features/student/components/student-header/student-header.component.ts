import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import { ThemeService } from '../../../../core/services/theme.service';
import { LocaleService } from '../../../../core/locale/locale.service';
import { NotificationStoreService } from '../../../../core/services/notification-store.service';
import type { AppNotification } from '../../../../core/models/notification.model';

@Component({
  selector: 'draya-student-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LogoComponent],
  templateUrl: './student-header.component.html',
  styleUrl: './student-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block sticky top-0 z-50' },
})
export class StudentHeaderComponent {
  protected readonly auth = inject(AuthService);
  protected readonly router = inject(Router);
  readonly themeService = inject(ThemeService);
  readonly localeService = inject(LocaleService);
  readonly notificationStore = inject(NotificationStoreService);

  readonly notifications = this.notificationStore.notifications;
  readonly unreadCount = this.notificationStore.unreadCount;
  readonly hasUnread = this.notificationStore.hasUnread;

  readonly userDisplayName = computed(() => {
    return this.auth.currentUser()?.fullName || 'الطالب';
  });

  readonly profilePictureUrl = computed(() => {
    const user = this.auth.currentUser();
    return user?.profilePictureUrl || user?.pictureUrl || null;
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

  onNotificationClick(notif: AppNotification): void {
    this.notificationStore.markAsRead(notif.id);
    this.closeNotifications();
    if (notif.link) {
      this.router.navigateByUrl(notif.link);
    }
  }

  markAllAsRead(event?: Event): void {
    event?.stopPropagation();
    this.notificationStore.markAllAsRead();
  }

  clearAll(event?: Event): void {
    event?.stopPropagation();
    this.notificationStore.clearAll();
  }

  removeNotification(id: string, event?: Event): void {
    event?.stopPropagation();
    this.notificationStore.removeNotification(id);
  }

  getRelativeTime(isoDate: string): string {
    return this.notificationStore.getRelativeTime(isoDate);
  }
}
