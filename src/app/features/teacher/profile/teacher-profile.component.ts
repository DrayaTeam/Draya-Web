import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TeacherProfileService } from '../services/teacher-profile.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../auth/services/auth.service';
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

  readonly _profile = signal<TeacherProfile | null>(null);
  readonly profile = this._profile.asReadonly();

  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly isUploadingPicture = signal<boolean>(false);
  readonly isChangingPassword = signal<boolean>(false);

  readonly specializationOptions: string[] = [
    'اللغة العربية',
    'اللغة الإنجليزية',
    'اللغة الفرنسية',
    'الرياضيات',
    'الفيزياء',
    'الكيمياء',
    'الأحياء',
    'الجيولوجيا',
    'التاريخ',
    'الجغرافيا',
    'الفلسفة والمنطق',
    'علم النفس والاجتماع',
    'الحاسب الآلي وتكنولوجيا المعلومات',
    'التعليم العام',
  ];

  readonly editForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phone: [''],
    specialization: [''],
    description: [''],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
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
          if (data.pictureUrl || data.fullName) {
            this.auth.updateLocalUser({
              profilePictureUrl: data.pictureUrl,
              pictureUrl: data.pictureUrl,
              fullName: data.fullName || user.fullName,
            });
          }
        },
        error: (err) => {
          // Even if the service doesn't catch it, we shouldn't crash the app
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

          // We can set a fallback empty profile so the form can still be used
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

  onSubmit(): void {
    if (this.editForm.invalid || this.isSaving()) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.editForm.getRawValue();

    // The backend requires all 4 fields to be sent for PUT /api/v1/teachers/profile
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
            summary: 'نجاح', // Will use translate pipe or keep simple for now
            detail: 'تم تحديث الملف الشخصي بنجاح.',
          });

          // Update local state
          this._profile.update((p) => {
            if (!p) return p;
            return { ...p, ...payload };
          });

          this.auth.updateLocalUser({
            fullName: payload.fullName,
          });
        },
        error: () => {
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء حفظ التعديلات.',
          });
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Optional: add file size/type validation here if needed
    // if (file.size > 5 * 1024 * 1024) { ... }

    this.isUploadingPicture.set(true);
    this.profileService
      .uploadProfilePicture(file)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isUploadingPicture.set(false);
          // Clear the input value so the same file can be selected again if needed
          input.value = '';
        }),
      )
      .subscribe({
        next: (responseUrl) => {
          this.messageService?.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم تحديث الصورة الشخصية بنجاح.',
          });

          if (responseUrl && typeof responseUrl === 'string' && responseUrl.startsWith('http')) {
            // If the POST returns the new image URL directly, update state immediately
            this._profile.update((p) => (p ? { ...p, pictureUrl: responseUrl } : p));
            this.auth.updateLocalUser({
              profilePictureUrl: responseUrl,
              pictureUrl: responseUrl,
            });
          } else {
            // Otherwise reload profile
            this.loadProfile();
          }
        },
        error: (err) => {
          console.error('Failed to upload profile picture', err);
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل رفع الصورة الشخصية. يرجى المحاولة مرة أخرى.',
          });
        },
      });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid || this.isChangingPassword()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.messageService?.add({
        severity: 'error',
        summary: 'تنبيه',
        detail: 'كلمة المرور الجديدة وتأكيدها غير متطابقين.',
      });
      return;
    }

    this.isChangingPassword.set(true);

    this.auth
      .changePassword({ currentPassword, newPassword, confirmPassword })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isChangingPassword.set(false)),
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService?.add({
              severity: 'success',
              summary: 'نجاح',
              detail: res.message || 'تم تغيير كلمة المرور بنجاح.',
            });
            this.passwordForm.reset();
          } else {
            this.messageService?.add({
              severity: 'error',
              summary: 'خطأ',
              detail: res.message || 'فشل تغيير كلمة المرور.',
            });
          }
        },
        error: () => {
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء تغيير كلمة المرور.',
          });
        },
      });
  }
}
