import { Component, ChangeDetectionStrategy, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = this.auth.isLoading;
  readonly error = this.auth.authError;
  readonly user = this.auth.currentUser;

  ngOnInit(): void {
    // Always fetch latest profile data on init to get fields missing from minimal login payload (email, etc.)
    this.auth.getProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  retry(): void {
    this.auth.getProfile().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  getRoleKey(role?: string): string {
    if (!role) return '';
    return `ROLES.${role.toUpperCase()}`;
  }
}
