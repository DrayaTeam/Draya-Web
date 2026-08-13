import { Component, ChangeDetectionStrategy, inject, signal, ElementRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { ApiError } from '../../../../core/models/api-error.model';
import { passwordStrengthValidator, calculatePasswordStrength } from '../../validators/password-strength.validator';
import { egyptianPhoneValidator } from '../../validators/egyptian-phone.validator';
import { PasswordStrength } from '../../constants/auth.constants';
import { matchFieldValidator } from '../../../../shared/validators/match-field.validator';

const noPureNumericValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value && /^\d+$/.test(control.value.trim())) {
    return { pureNumeric: true };
  }
  return null;
};

@Component({
  selector: 'app-register-teacher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register-teacher.component.html'
})
export class RegisterTeacherComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService, { optional: true });
  private readonly translate = inject(TranslateService);
  private readonly el = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3), noPureNumericValidator]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, egyptianPhoneValidator()]],
    specialization: ['', [Validators.required]],
    description: [''],
    password: ['', [Validators.required, passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required, matchFieldValidator('password')]],
    termsAccepted: [false, Validators.requiredTrue]
  });

  readonly loading = this.auth.isLoading;
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly passwordStrength = signal<PasswordStrength>('weak');

  constructor() {
    this.registerForm.controls.password.valueChanges.pipe(takeUntilDestroyed()).subscribe(val => {
      this.passwordStrength.set(calculatePasswordStrength(val));
      this.registerForm.controls.confirmPassword.updateValueAndValidity();
    });
  }

  togglePassword(): void {
    this.showPassword.update(s => !s);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(s => !s);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      return;
    }

    if (this.loading()) return;

    // Reset previous explicit server errors
    this.clearServerErrors();

    const formValue = this.registerForm.getRawValue();
    const payload = {
      fullName: formValue.fullName.trim(),
      email: formValue.email.trim().toLowerCase(),
      phone: formValue.phone,
      specialization: formValue.specialization.trim(),
      description: formValue.description?.trim() || '',
      password: formValue.password,
      confirmPassword: formValue.confirmPassword
    };

    this.auth.registerTeacher(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.router.navigate(['/teacher/classrooms']);
      },
      error: (err: ApiError) => {
        if (err.code === 'EMAIL_ALREADY_EXISTS') {
          this.registerForm.controls.email.setErrors({ emailTaken: true });
          this.scrollToFirstInvalidControl();
        } else if (err.code === 'VALIDATION_FAILED') {
          if (err.details && err.details.length > 0) {
            err.details.forEach(detail => {
              const control = this.registerForm.get(detail.field);
              if (control) {
                control.setErrors({ serverError: detail.issue });
              }
            });
            this.scrollToFirstInvalidControl();
          } else {
            this.showGenericError();
          }
        } else {
          this.showGenericError();
        }
      }
    });
  }

  private clearServerErrors() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      if (control?.hasError('serverError') || control?.hasError('emailTaken')) {
        control.updateValueAndValidity();
      }
    });
  }

  private scrollToFirstInvalidControl() {
    setTimeout(() => {
      const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
        "form .ng-invalid"
      );
      if (firstInvalidControl) {
        firstInvalidControl.focus();
      }
    }, 0);
  }

  private showGenericError() {
    this.messageService?.add({
      severity: 'error',
      summary: this.translate.instant('ERROR.TITLE'),
      detail: this.translate.instant('COMMON.ERROR')
    });
  }
}
