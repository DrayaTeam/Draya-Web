import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

export interface AdminNavItem {
  labelKey: string;
  link: string;
  icon: string;
  exact?: boolean;
  badgeSignal?: 'pendingWithdrawals';
}

@Component({
  selector: 'draya-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly isSidebarCollapsed = signal<boolean>(false);
  readonly isMobileSidebarOpen = signal<boolean>(false);
  readonly isProfileMenuOpen = signal<boolean>(false);
  readonly pendingWithdrawalsCount = signal<number>(0);

  private readonly routerEvents = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
  );

  readonly currentRoute = computed(() => {
    const ev = this.routerEvents();
    return ev instanceof NavigationEnd ? ev.urlAfterRedirects : this.router.url;
  });

  readonly pageTitle = computed(() => {
    const url = this.currentRoute();
    if (url.includes('/admin/withdrawals')) return 'ADMIN.NAV.WITHDRAWALS';
    if (url.includes('/admin/adjustments')) return 'ADMIN.NAV.ADJUSTMENTS';
    if (url.includes('/admin/classroom-types')) return 'ADMIN.NAV.CLASSROOM_TYPES';
    if (url.includes('/admin/grade-levels')) return 'ADMIN.NAV.GRADE_LEVELS';
    if (url.includes('/admin/supervisors')) return 'ADMIN.NAV.SUPERVISORS';
    if (url.includes('/admin/settings')) return 'ADMIN.NAV.SETTINGS';
    return 'ADMIN.NAV.DASHBOARD';
  });

  readonly breadcrumbKey = computed(() => {
    const url = this.currentRoute();
    if (url.includes('/admin/withdrawals')) return 'ADMIN.BREADCRUMB.WITHDRAWALS';
    if (url.includes('/admin/adjustments')) return 'ADMIN.BREADCRUMB.ADJUSTMENTS';
    if (url.includes('/admin/classroom-types')) return 'ADMIN.BREADCRUMB.CLASSROOM_TYPES';
    if (url.includes('/admin/grade-levels')) return 'ADMIN.BREADCRUMB.GRADE_LEVELS';
    if (url.includes('/admin/supervisors')) return 'ADMIN.BREADCRUMB.SUPERVISORS';
    if (url.includes('/admin/settings')) return 'ADMIN.BREADCRUMB.SETTINGS';
    return 'ADMIN.BREADCRUMB.DASHBOARD';
  });

  readonly currentUserInitial = computed(() => {
    const user = this.auth.currentUser();
    return user?.fullName?.charAt(0) ?? 'م';
  });

  readonly currentUserName = computed(() => {
    const user = this.auth.currentUser();
    return user?.fullName ? `أ. ${user.fullName}` : 'المدير';
  });

  readonly navItems: AdminNavItem[] = [
    {
      labelKey: 'ADMIN.NAV.DASHBOARD',
      link: '/admin/dashboard',
      icon: 'pi pi-th-large',
      exact: true,
    },
    {
      labelKey: 'ADMIN.NAV.WITHDRAWALS',
      link: '/admin/withdrawals',
      icon: 'pi pi-wallet',
      badgeSignal: 'pendingWithdrawals',
    },
    { labelKey: 'ADMIN.NAV.ADJUSTMENTS', link: '/admin/adjustments', icon: 'pi pi-sliders-h' },
    {
      labelKey: 'ADMIN.NAV.CLASSROOM_TYPES',
      link: '/admin/classroom-types',
      icon: 'pi pi-th-large',
    },
    {
      labelKey: 'ADMIN.NAV.GRADE_LEVELS',
      link: '/admin/grade-levels',
      icon: 'pi pi-graduation-cap',
    },
    { labelKey: 'ADMIN.NAV.SUPERVISORS', link: '/admin/supervisors', icon: 'pi pi-user-edit' },
    { labelKey: 'ADMIN.NAV.SETTINGS', link: '/admin/settings', icon: 'pi pi-cog' },
  ];

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((v) => !v);
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update((v) => !v);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update((v) => !v);
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  logout(): void {
    this.closeProfileMenu();
    this.auth.logout();
  }
}
