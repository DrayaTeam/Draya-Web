import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
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
import {
  passwordStrengthValidator,
  calculatePasswordStrength,
} from '../../validators/password-strength.validator';
import { matchFieldValidator } from '../../../../shared/validators/match-field.validator';
import { PasswordStrength } from '../../constants/auth.constants';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterLink],
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
  readonly resetForm = this.fb.nonNullable.group({
    otpCode: ['', [Validators.required, Validators.minLength(4)]],
    newPassword: ['', [Validators.required, passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required, matchFieldValidator('newPassword')]],
  });

  readonly currentStep = signal<1 | 2>(1);
  readonly loading = this.auth.isLoading;
  readonly isSuccess = signal<boolean>(false);

  // Password Visibility & Strength for Step 2
  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  readonly passwordStrength = signal<PasswordStrength>('weak');

  // Resend OTP Countdown Timer (60 seconds)
  readonly resendCountdown = signal<number>(0);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.resetForm.controls.newPassword.valueChanges.pipe(takeUntilDestroyed()).subscribe((val) => {
      this.passwordStrength.set(calculatePasswordStrength(val));
      this.resetForm.controls.confirmPassword.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  startResendTimer(): void {
    this.clearTimer();
    this.resendCountdown.set(60);
    this.timerInterval = setInterval(() => {
      const current = this.resendCountdown();
      if (current <= 1) {
        this.resendCountdown.set(0);
        this.clearTimer();
      } else {
        this.resendCountdown.set(current - 1);
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Step 1: Send OTP to Email
  onRequestReset(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const email = this.emailForm.getRawValue().email.trim().toLowerCase();

    this.auth
      .forgotPassword(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success(
            this.translate.instant('AUTH.FORGOT_PASSWORD.OTP_SENT', {
              defaultValue: `تم إرسال رمز التحقق إلى بريدك الإلكتروني: ${email}`,
            }),
          );
          this.currentStep.set(2);
          this.startResendTimer();
        },
        error: (err: ApiError) => {
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
    if (this.resendCountdown() > 0) return;

    const email = this.emailForm.getRawValue().email.trim().toLowerCase();
    if (!email) return;

    this.auth
      .forgotPassword(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success('تمت إعادة إرسال رمز التحقق بنجاح');
          this.startResendTimer();
        },
        error: (err: ApiError) => {
          this.toast.error(err?.message || 'فشلت إعادة إرسال الرمز');
        },
      });
  }

  // Back to Step 1 (Change Email)
  onBackToStep1(): void {
    this.clearTimer();
    this.currentStep.set(1);
  }

  // Step 2: Confirm OTP & New Password
  onConfirmReset(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    const email = this.emailForm.getRawValue().email.trim().toLowerCase();
    const { otpCode, newPassword } = this.resetForm.getRawValue();

    this.auth
      .resetPassword({
        email,
        token: otpCode.trim(),
        newPassword,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSuccess.set(true);
          this.toast.success(
            this.translate.instant('AUTH.FORGOT_PASSWORD.RESET_SUCCESS', {
              defaultValue: 'تمت إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.',
            }),
          );
          setTimeout(() => {
            this.router.navigate(['/auth/login'], {
              queryParams: { email, reset: 'success' },
            });
          }, 1500);
        },
        error: (err: ApiError) => {
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
