// src/app/features/auth/login/login.component.ts
// Purpose: Login page for the Draya platform.
// Placeholder form wired to AuthService.login(). No real validation yet.
// Eventually: will use ReactiveForms with validation, error display, and returnUrl redirect.

import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <!-- Full-height centered login layout — logical padding (ps-/pe-) -->
    <div class="flex min-h-screen items-center justify-center bg-background px-4">
      <div class="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <!-- Header -->
        <div class="space-y-1">
          <h1 class="text-2xl font-bold text-foreground">
            {{ 'app.name' | translate }}
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ 'auth.login' | translate }}
          </p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="space-y-1">
            <label class="block text-sm font-medium text-foreground" for="login-email">
              {{ 'auth.email' | translate }}
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              [(ngModel)]="email"
              required
              class="w-full rounded-md border border-border bg-input-background px-3 py-2
                     text-sm text-foreground placeholder:text-muted-foreground
                     focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div class="space-y-1">
            <label class="block text-sm font-medium text-foreground" for="login-password">
              {{ 'auth.password' | translate }}
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              [(ngModel)]="password"
              required
              class="w-full rounded-md border border-border bg-input-background px-3 py-2
                     text-sm text-foreground placeholder:text-muted-foreground
                     focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          @if (errorMessage()) {
            <p class="text-sm text-destructive">{{ errorMessage() }}</p>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold
                   text-primary-foreground transition-opacity hover:opacity-90
                   disabled:cursor-not-allowed disabled:opacity-50">
            @if (loading()) {
              {{ 'common.loading' | translate }}
            } @else {
              {{ 'auth.loginButton' | translate }}
            }
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected loading = signal(false);
  protected errorMessage = signal('');

  protected onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.errorMessage.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const user = this.auth.currentUser();
        // Redirect to the user's role-specific dashboard.
        const dashboards: Record<string, string> = {
          teacher: '/teacher/dashboard',
          student: '/student/dashboard',
          parent: '/parent/reports',
        };
        this.router.navigate([dashboards[user?.role ?? ''] ?? '/']);
      },
      error: () => {
        this.errorMessage.set('auth.loginError');
        this.loading.set(false);
      },
    });
  }
}
