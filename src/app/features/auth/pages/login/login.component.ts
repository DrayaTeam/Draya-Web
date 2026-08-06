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
          parent: '/parent/dashboard',
        };
        this.router.navigate([dashboards[role] || '/']);
      },
      error: (err: ApiError) => {
        if (err.code === 'UNAUTHORIZED') {
          // Show inline error for incorrect credentials
          this.inlineError.set(err.message);
          // Mark form as untouched so it doesn't immediately lock out resubmit, but wait!
          // We want them to modify and resubmit. If untouched is checked for submit, we must mark touched or leave it touched.
          // Actually if we just errored, they can just edit and submit again. If it's valid it will submit.
          // We don't need to mark untouched, but wait, `[disabled]="... || loginForm.untouched"` means if they just clicked submit, it's already touched. So they can submit again.
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
