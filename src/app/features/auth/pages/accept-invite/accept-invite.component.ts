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
  private readonly messageService = inject(MessageService, { optional: true });
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly acceptForm = this.fb.nonNullable.group({
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
    this.acceptForm.controls.password.valueChanges.pipe(takeUntilDestroyed()).subscribe((val) => {
      this.passwordStrength.set(calculatePasswordStrength(val));
      this.acceptForm.controls.confirmPassword.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    const rawToken =
      this.route.snapshot.queryParamMap.get('token') ||
      this.route.snapshot.queryParamMap.get('code');
    if (!rawToken) {
      this.isInvalidToken.set(true);
      return;
    }
    this.token = rawToken;
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

    const { password } = this.acceptForm.getRawValue();

    this.auth
      .acceptInvite({
        token: this.token,
        newPassword: password,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSuccess.set(true);
          this.messageService?.add({
            severity: 'success',
            summary: this.translate.instant('AUTH.ACCEPT_INVITE.SUCCESS_TITLE', {
              defaultValue: 'تم تفعيل الحساب بنجاح',
            }),
            detail: this.translate.instant('AUTH.ACCEPT_INVITE.SUCCESS_DESC', {
              defaultValue: 'يمكنك الآن تسجيل الدخول إلى لوحة إدارة دراية.',
            }),
          });
        },
        error: (err: ApiError) => {
          this.messageService?.add({
            severity: 'error',
            summary: this.translate.instant('COMMON.ERROR', { defaultValue: 'خطأ' }),
            detail:
              err?.message ||
              this.translate.instant('AUTH.ACCEPT_INVITE.ERROR', {
                defaultValue: 'تعذر تفعيل الحساب أو رابط الدعوة غير صالح أو منتهي.',
              }),
          });
        },
      });
  }
}
