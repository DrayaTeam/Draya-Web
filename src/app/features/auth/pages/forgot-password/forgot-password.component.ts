import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { ApiError } from '../../../../core/models/api-error.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService, { optional: true });
  private readonly translate = inject(TranslateService);

  readonly forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  readonly loading = this.auth.isLoading;
  readonly isSuccess = signal(false);

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    if (this.loading()) return;

    const email = this.forgotForm.getRawValue().email.trim().toLowerCase();

    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.isSuccess.set(true);
      },
      error: (err: ApiError) => {
        this.messageService?.add({
          severity: 'error',
          summary: this.translate.instant('error.title'),
          detail: err.message || this.translate.instant('common.error')
        });
      }
    });
  }
}
