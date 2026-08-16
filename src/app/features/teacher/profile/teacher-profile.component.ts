import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
  ChangeDetectorRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TeacherProfileService } from '../services/teacher-profile.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../auth';
import { TeacherProfile } from '../../../core/models/teacher.model';
import { finalize } from 'rxjs';
import { decodeToken } from '../../../core/auth/jwt.util';

@Component({
  selector: 'draya-teacher-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './teacher-profile.component.html',
  styleUrl: './teacher-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class TeacherProfileComponent implements OnInit {
  private readonly profileService = inject(TeacherProfileService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService, { optional: true });
  readonly themeService = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly _profile = signal<TeacherProfile | null>(null);
  readonly profile = this._profile.asReadonly();

  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly uploadingAvatar = signal<boolean>(false);
  readonly avatarUrl = signal<string>('');
  readonly isSavingPassword = signal<boolean>(false);

  readonly editForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: [''],
    specialization: [''],
    description: [''],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.avatarUrl.set(this.auth.currentUser()?.profilePictureUrl || '');
    this.loadProfile();
  }

  loadProfile(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.isLoading.set(true);
    this.profileService
      .getProfile(user.userId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (data) => {
          this._profile.set(data);
          this.resetForm(data);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.warn('Could not load teacher profile:', err);

          let realEmail = user.email || '';
          let realFullName = user.fullName || '';
          const token = this.auth.accessToken();
          if (token) {
            const claims = decodeToken(token);
            if (claims) {
              realEmail = claims.email || realEmail;
              realFullName = claims.fullName || realFullName;
            }
          }

          const fallback: TeacherProfile = {
            userId: user.userId,
            email: realEmail,
            fullName: realFullName,
            phone: '',
            specialization: '',
            description: '',
          };
          this._profile.set(fallback);
          this.resetForm(fallback);
          this.cdr.markForCheck();
        },
      });
  }

  resetForm(data: TeacherProfile): void {
    this.editForm.patchValue({
      fullName: data.fullName || '',
      phone: data.phone || '',
      specialization: data.specialization || '',
      description: data.description || '',
    });
  }

  getInitials(name: string): string {
    if (!name) return 'م';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 1);
    return parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1);
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.messageService?.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يرجى اختيار ملف صورة صالح (.png, .jpg, .jpeg, .webp).',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.messageService?.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.',
      });
      return;
    }

    this.uploadingAvatar.set(true);
    this.cdr.markForCheck();

    this.profileService.uploadAvatar(file).subscribe({
      next: (res) => {
        this.uploadingAvatar.set(false);
        if (res.success && res.profilePictureUrl) {
          this.avatarUrl.set(res.profilePictureUrl);
          this.messageService?.add({
            severity: 'success',
            summary: 'نجاح',
            detail: res.message,
          });
        } else {
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: res.message,
          });
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.uploadingAvatar.set(false);
        this.messageService?.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل رفع الصورة إلى السحابة.',
        });
        this.cdr.markForCheck();
      },
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid || this.isSaving()) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.editForm.getRawValue();

    const payload = {
      fullName: formValue.fullName.trim(),
      phone: formValue.phone.trim(),
      specialization: formValue.specialization.trim(),
      description: formValue.description.trim(),
    };

    this.profileService
      .updateProfile(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSaving.set(false)),
      )
      .subscribe({
        next: () => {
          this.messageService?.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم تحديث الملف الشخصي بنجاح.',
          });

          this._profile.update((p) => {
            if (!p) return p;
            return { ...p, ...payload };
          });
          this.cdr.markForCheck();
        },
        error: () => {
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء حفظ التعديلات.',
          });
          this.cdr.markForCheck();
        },
      });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid || this.isSavingPassword()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (newPassword.length < 8) {
      this.messageService?.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف.',
      });
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      this.messageService?.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل (A-Z).',
      });
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      this.messageService?.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل (0-9).',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      this.messageService?.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين.',
      });
      return;
    }

    this.isSavingPassword.set(true);
    this.cdr.markForCheck();

    this.profileService
      .updatePassword(currentPassword, newPassword, confirmPassword)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSavingPassword.set(false)),
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.passwordForm.reset();
            this.messageService?.add({
              severity: 'success',
              summary: 'نجاح',
              detail: res.message,
            });
          } else {
            this.messageService?.add({
              severity: 'error',
              summary: 'خطأ',
              detail: res.message,
            });
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: err?.message || 'فشل تغيير كلمة المرور.',
          });
          this.cdr.markForCheck();
        },
      });
  }
}
