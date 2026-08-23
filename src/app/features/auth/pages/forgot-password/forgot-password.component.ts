import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  DestroyRef,
  OnDestroy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ApiError } from '../../../../core/models/api-error.model';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';
import {
  passwordStrengthValidator,
  calculatePasswordStrength,
} from '../../validators/password-strength.validator';
import { matchFieldValidator } from '../../../../shared/validators/match-field.validator';
import { PasswordStrength } from '../../constants/auth.constants';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterLink, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Step 1 Form (Email Request)
  readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  // Step 2 Form (OTP + New Password)
  // The backend issues a 6-digit numeric OTP (see BACKEND_ISSUES_REPORT.md) —
  // locking the pattern here catches a mistyped code before it round-trips to
  // the server.
  readonly resetForm = this.fb.nonNullable.group({
    otpCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    newPassword: ['', [Validators.required, passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required, matchFieldValidator('newPassword')]],
  });

  readonly currentStep = signal<1 | 2>(1);
  readonly isSuccess = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly loading = computed(() => this.auth.isLoading() || this.isSubmitting());

  // Password Visibility & Strength
  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  readonly passwordStrength = signal<PasswordStrength>('weak');

  // Password requirements real-time checks
  readonly newPasswordValue = signal<string>('');
  readonly confirmPasswordValue = signal<string>('');

  readonly hasMinLength = computed(() => this.newPasswordValue().length >= 8);
  readonly hasUpperLower = computed(
    () => /[A-Z]/.test(this.newPasswordValue()) && /[a-z]/.test(this.newPasswordValue()),
  );
  readonly hasNumber = computed(() => /\d/.test(this.newPasswordValue()));
  readonly hasSpecial = computed(() => /[^A-Za-z0-9]/.test(this.newPasswordValue()));
  readonly isMatching = computed(() => {
    const p = this.newPasswordValue();
    const c = this.confirmPasswordValue();
    return p.length > 0 && c.length > 0 && p === c;
  });

  // Resend OTP Countdown Timer (60 seconds)
  readonly resendCountdown = signal<number>(0);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Auto-redirect countdown (3 seconds)
  readonly redirectCountdown = signal<number>(3);
  private redirectInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.resetForm.controls.newPassword.valueChanges.pipe(takeUntilDestroyed()).subscribe((val) => {
      this.newPasswordValue.set(val);
      this.passwordStrength.set(calculatePasswordStrength(val));
      this.resetForm.controls.confirmPassword.updateValueAndValidity();
    });

    this.resetForm.controls.confirmPassword.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((val) => {
        this.confirmPasswordValue.set(val);
      });
  }

  ngOnDestroy(): void {
    this.clearAllTimers();
  }

  toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  startResendTimer(): void {
    this.clearResendTimer();
    this.resendCountdown.set(60);
    this.timerInterval = setInterval(() => {
      const current = this.resendCountdown();
      if (current <= 1) {
        this.resendCountdown.set(0);
        this.clearResendTimer();
      } else {
        this.resendCountdown.set(current - 1);
      }
    }, 1000);
  }

  private clearResendTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private clearRedirectTimer(): void {
    if (this.redirectInterval) {
      clearInterval(this.redirectInterval);
      this.redirectInterval = null;
    }
  }

  private clearAllTimers(): void {
    this.clearResendTimer();
    this.clearRedirectTimer();
  }

  // Format OTP code input (remove spaces / allow alphanumeric or digits)
  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      const cleanValue = input.value.replace(/\D/g, '').slice(0, 6);
      this.resetForm.controls.otpCode.setValue(cleanValue, { emitEvent: false });
      input.value = cleanValue;
    }
  }

  // Step 1: Send OTP to Email
  onRequestReset(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const email = this.emailForm.getRawValue().email.trim().toLowerCase();
    this.isSubmitting.set(true);

    this.auth
      .forgotPassword(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.toast.success(
            this.translate.instant('AUTH.FORGOT_PASSWORD.OTP_SENT', {
              defaultValue: `تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح`,
            }),
          );
          this.currentStep.set(2);
          this.startResendTimer();
        },
        error: (err: ApiError) => {
          this.isSubmitting.set(false);
          const msg =
            err?.message ||
            this.translate.instant('AUTH.FORGOT_PASSWORD.ERROR', {
              defaultValue: 'تعذر إرسال رمز التحقق. يرجى التحقق من صحة البريد والمحاولة مرة أخرى.',
            });
          this.toast.error(msg);
        },
      });
  }

  // Resend OTP Code
  onResendCode(): void {
    if (this.resendCountdown() > 0 || this.loading()) return;

    const email = this.emailForm.getRawValue().email.trim().toLowerCase();
    if (!email) return;

    this.isSubmitting.set(true);
    this.auth
      .forgotPassword(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.toast.success(
            this.translate.instant('AUTH.FORGOT_PASSWORD.OTP_SENT', {
              defaultValue: 'تمت إعادة إرسال رمز التحقق بنجاح',
            }),
          );
          this.startResendTimer();
        },
        error: (err: ApiError) => {
          this.isSubmitting.set(false);
          this.toast.error(
            err?.message ||
              this.translate.instant('AUTH.FORGOT_PASSWORD.ERROR', {
                defaultValue: 'فشلت إعادة إرسال الرمز',
              }),
          );
        },
      });
  }

  // Back to Step 1 (Change Email)
  onBackToStep1(): void {
    this.clearResendTimer();
    this.currentStep.set(1);
  }

  // Navigate to login immediately
  goToLogin(): void {
    this.clearAllTimers();
    const email = this.emailForm.getRawValue().email.trim().toLowerCase();
    this.router.navigate(['/auth/login'], {
      queryParams: { email, reset: 'success' },
    });
  }

  // Step 2: Confirm OTP & New Password
  onConfirmReset(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const email = this.emailForm.getRawValue().email.trim().toLowerCase();
    const { otpCode, newPassword } = this.resetForm.getRawValue();
    this.isSubmitting.set(true);

    this.auth
      .resetPassword({
        email,
        token: otpCode.trim(),
        newPassword,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isSuccess.set(true);
          this.toast.success(
            this.translate.instant('AUTH.FORGOT_PASSWORD.RESET_SUCCESS', {
              defaultValue: 'تمت إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.',
            }),
          );

          // Start 3s countdown redirect
          this.redirectCountdown.set(3);
          this.redirectInterval = setInterval(() => {
            const count = this.redirectCountdown();
            if (count <= 1) {
              this.clearRedirectTimer();
              this.goToLogin();
            } else {
              this.redirectCountdown.set(count - 1);
            }
          }, 1000);
        },
        error: (err: ApiError) => {
          this.isSubmitting.set(false);
          const msg =
            err?.message ||
            this.translate.instant('AUTH.FORGOT_PASSWORD.CONFIRM_ERROR', {
              defaultValue: 'رمز التحقق غير صحيح أو منتهي الصلاحية.',
            });
          this.toast.error(msg);
        },
      });
  }
}
