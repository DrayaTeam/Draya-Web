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
  selector: 'app-accept-invite',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accept-invite.component.html',
  styleUrls: ['./accept-invite.component.scss'],
})
export class AcceptInviteComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly acceptForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.pattern(/^(010|011|012|015)[0-9]{8}$/)]],
    password: ['', [Validators.required, passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required, matchFieldValidator('password')]],
  });

  readonly loading = this.auth.isLoading;
  readonly isSuccess = signal(false);
  readonly isInvalidToken = signal(false);

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly passwordStrength = signal<PasswordStrength>('weak');

  token = '';
  email = '';

  constructor() {
    this.acceptForm.controls.password.valueChanges.pipe(takeUntilDestroyed()).subscribe((val) => {
      this.passwordStrength.set(calculatePasswordStrength(val));
      this.acceptForm.controls.confirmPassword.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    const rawToken =
      this.route.snapshot.queryParamMap.get('token') ||
      this.route.snapshot.queryParamMap.get('code');
    const rawEmail = this.route.snapshot.queryParamMap.get('email') || '';

    if (!rawToken) {
      this.isInvalidToken.set(true);
      return;
    }
    this.token = rawToken;
    this.email = rawEmail;
  }

  toggleShowPassword(): void {
    this.showPassword.update((val) => !val);
  }

  toggleShowConfirmPassword(): void {
    this.showConfirmPassword.update((val) => !val);
  }

  onSubmit(): void {
    if (this.acceptForm.invalid || !this.token) {
      this.acceptForm.markAllAsTouched();
      return;
    }

    const { fullName, phone, password, confirmPassword } = this.acceptForm.getRawValue();

    this.auth
      .acceptInvite({
        token: this.token,
        email: this.email,
        password,
        newPassword: password,
        confirmPassword,
        fullName,
        phone,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSuccess.set(true);
          this.toast.success(
            this.translate.instant('AUTH.ACCEPT_INVITE.SUCCESS_TITLE', {
              defaultValue: 'تم تفعيل حساب المشرف بنجاح! مرحباً بك في دراية.',
            }),
          );
          // Redirect to login or admin dashboard
          setTimeout(() => {
            this.router.navigate(['/auth/login'], {
              queryParams: { email: this.email, activated: 'true' },
            });
          }, 1500);
        },
        error: (err: ApiError) => {
          const msg =
            err?.message ||
            this.translate.instant('AUTH.ACCEPT_INVITE.ERROR', {
              defaultValue: 'تعذر تفعيل الحساب أو رابط الدعوة غير صالح أو منتهي.',
            });
          this.toast.error(msg);
        },
      });
  }
}
