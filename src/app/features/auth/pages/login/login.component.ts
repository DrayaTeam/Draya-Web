import { Component, ChangeDetectionStrategy, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { ApiError } from '../../../../core/models/api-error.model';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService, { optional: true });
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  readonly loading = this.auth.isLoading;
  readonly inlineError = signal<string | null>(null);
  readonly showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.update(s => !s);
  }

  onSubmit(): void {
    // Prevent double-submit by checking loading state
    if (this.loginForm.invalid || this.loginForm.untouched || this.loading()) return;
    
    // Clear old error for clean validation
    this.inlineError.set(null);

    const { email, password, rememberMe } = this.loginForm.getRawValue();

    this.auth.login({ email, password, rememberMe }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const role = res.user.role;
        const dashboards: Record<string, string> = {
          teacher: '/teacher/dashboard',
          student: '/student/dashboard',
          parent: '/parent/reports',
        };
        const targetUrl = dashboards[role];
        if (targetUrl) {
          this.router.navigate([targetUrl]);
        } else {
          this.messageService?.add({
            severity: 'error',
            summary: this.translate.instant('ERROR.TITLE'),
            detail: this.translate.instant('AUTH.LOGIN.UNRECOGNIZED_ROLE', { role })
          });
        }
      },
      error: (err: ApiError) => {
        if (err.code === 'INVALID_CREDENTIALS' || err.code === 'HTTP_401' || err.code === 'SESSION_EXPIRED' || err.code === 'HTTP_403') {
          // Show inline error for incorrect credentials
          this.inlineError.set(this.translate.instant('AUTH.LOGIN.ERROR'));
          // Mark form as touched so it doesn't immediately lock out resubmit
          this.loginForm.markAsTouched(); 
        } else {
          // Unexpected or network error
          this.messageService?.add({
            severity: 'error',
            summary: this.translate.instant('ERROR.TITLE'),
            detail: this.translate.instant('COMMON.ERROR')
          });
        }
      }
    });
  }
}
