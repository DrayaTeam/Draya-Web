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
  templateUrl: './login.component.html',
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
