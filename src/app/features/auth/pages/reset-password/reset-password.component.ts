import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { ApiError } from '../../../../core/models/api-error.model';
import {
  passwordStrengthValidator,
  calculatePasswordStrength,
} from '../../validators/password-strength.validator';
import { matchFieldValidator } from '../../../../shared/validators/match-field.validator';
import { PasswordStrength } from '../../constants/auth.constants';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService, { optional: true });
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly resetForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required, matchFieldValidator('password')]],
  });

  readonly loading = this.auth.isLoading;
  readonly isSuccess = signal(false);
  readonly isInvalidToken = signal(false);

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly passwordStrength = signal<PasswordStrength>('weak');

  private token = '';

  constructor() {
    this.resetForm.controls.password.valueChanges.pipe(takeUntilDestroyed()).subscribe((val) => {
      this.passwordStrength.set(calculatePasswordStrength(val));
      this.resetForm.controls.confirmPassword.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    const t = this.route.snapshot.queryParamMap.get('token');
    if (!t) {
      this.isInvalidToken.set(true);
    } else {
      this.token = t;
    }
  }

  togglePassword(): void {
    this.showPassword.update((s) => !s);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((s) => !s);
  }

  onSubmit(): void {
    if (this.resetForm.invalid || this.isInvalidToken()) {
      this.resetForm.markAllAsTouched();
      return;
    }

    if (this.loading()) return;

    this.clearServerErrors();

    const newPassword = this.resetForm.getRawValue().password;

    this.auth
      .resetPassword({ token: this.token, newPassword })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSuccess.set(true);
        },
        error: (err: ApiError) => {
          if (err.code === 'INVALID_PASSWORD_RESET_TOKEN') {
            // Recon confirmed: invalid/expired token returns 401 with this code (NOT 400 as Swagger suggested)
            this.isInvalidToken.set(true);
          } else if (err.code === 'VALIDATION_FAILED') {
            if (err.details && err.details.length > 0) {
              err.details.forEach((detail) => {
                const control = this.resetForm.get(
                  detail.field === 'newPassword' ? 'password' : detail.field,
                );
                if (control) {
                  control.setErrors({ serverError: detail.issue });
                }
              });
            } else {
              this.showGenericError(err.message);
            }
          } else {
            this.showGenericError(err.message);
          }
        },
      });
  }

  private clearServerErrors() {
    Object.keys(this.resetForm.controls).forEach((key) => {
      const control = this.resetForm.get(key);
      if (control?.hasError('serverError')) {
        control.updateValueAndValidity();
      }
    });
  }

  private showGenericError(customMessage?: string) {
    this.messageService?.add({
      severity: 'error',
      summary: this.translate.instant('ERROR.TITLE'),
      detail: customMessage || this.translate.instant('COMMON.ERROR'),
    });
  }
}
