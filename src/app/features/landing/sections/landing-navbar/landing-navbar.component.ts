import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../auth/services/auth.service';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'draya-landing-navbar',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LogoComponent],
  templateUrl: './landing-navbar.component.html',
  styleUrl: './landing-navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingNavbarComponent implements OnInit, OnDestroy {
  protected readonly auth = inject(AuthService);
  readonly isAuthenticated = this.auth.isAuthenticated;

  readonly dashboardUrl = computed(() => {
    const role = this.auth.currentUser()?.role?.toLowerCase();
    if (role === 'admin' || role === 'superadmin') return '/admin/dashboard';
    if (role === 'teacher') return '/teacher/dashboard';
    return '/student/dashboard';
  });

  readonly scrolled = signal(false);
  readonly mobileMenuOpen = signal(false);

  readonly navLinks = [
    { labelKey: 'LANDING.NAVBAR.HOME', href: '#hero' },
    { labelKey: 'LANDING.NAVBAR.FEATURES', href: '#features' },
    { labelKey: 'LANDING.NAVBAR.PRICING', href: '#pricing' },
    { labelKey: 'LANDING.NAVBAR.FAQ', href: '#faq' },
  ];

  private readonly scrollHandler = (): void => {
    this.scrolled.set(window.scrollY > 80);
  };

  ngOnInit(): void {
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  scrollToTop(): void {
    this.closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onNavLinkClick(href: string): void {
    this.closeMobileMenu();
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
