// src/app/features/student/profile/student-profile.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentProfileService } from '../../../core/services/student-profile.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'draya-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentProfileComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(StudentProfileService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly activeTab = signal<'info' | 'parent' | 'security'>('info');
  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);
  readonly uploadingAvatar = signal<boolean>(false);
  readonly avatarUrl = signal<string>('');

  // Form Models initialized directly from logged-in session
  name = this.auth.currentUser()?.fullName || '';
  email = this.auth.currentUser()?.email || '';
  phone = this.auth.currentUser()?.phone || '';
  grade = 'الصف الثالث الثانوي - علمي رياضة';
  parentName = '';
  parentPhone = '';
  parentEmail = '';
  dateOfBirth = '';

  currentPass = '';
  newPass = '';
  confirmPass = '';

  ngOnInit(): void {
    this.avatarUrl.set(this.auth.currentUser()?.profilePictureUrl || '');

    this.profileService.getProfile().subscribe({
      next: (data) => {
        if (data) {
          this.name = data.fullName || this.name;
          this.email = data.email || this.email;
          this.phone = data.phone || this.phone;
          this.grade = data.gradeLevel || this.grade;
          this.parentName = data.parentName || this.parentName;
          this.parentPhone = data.parentPhone || this.parentPhone;
          this.parentEmail = data.parentEmail || this.parentEmail;
          this.dateOfBirth = data.dateOfBirth || this.dateOfBirth;
          if (data.profilePictureUrl) {
            this.avatarUrl.set(data.profilePictureUrl);
          }
        }
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  setTab(tab: 'info' | 'parent' | 'security'): void {
    this.activeTab.set(tab);
    this.cdr.markForCheck();
  }

  onSaveProfile(e?: Event): void {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const updatedName = this.name.trim();
    let updatedParentEmail = this.parentEmail.trim();

    if (!updatedParentEmail && this.auth.currentUser()?.parentGuardianEmail) {
      updatedParentEmail = this.auth.currentUser()!.parentGuardianEmail!.trim();
    }

    if (!updatedName) {
      this.toast.warning('تنبيه', 'يرجى إدخال اسم الطالب.');
      return;
    }

    if (
      updatedParentEmail &&
      (!updatedParentEmail.includes('@') || !updatedParentEmail.includes('.'))
    ) {
      this.toast.warning('تنبيه', 'يرجى إدخال بريد إلكتروني صحيح لولي الأمر.');
      return;
    }

    this.saving.set(true);
    this.cdr.markForCheck();

    this.profileService
      .updateProfile({
        fullName: updatedName,
        parentGuardianEmail: updatedParentEmail || undefined,
        parentGuardianName: this.parentName.trim() || undefined,
        parentGuardianPhone: this.parentPhone.trim() || undefined,
        dateOfBirth: this.dateOfBirth || undefined,
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.name = updatedName;
          if (updatedParentEmail) {
            this.parentEmail = updatedParentEmail;
          }
          this.cdr.detectChanges();
          if (res.success) {
            this.toast.success('تم الحفظ', res.message);
          } else {
            this.toast.error('تنبيه', res.message);
          }
        },
        error: (err) => {
          this.saving.set(false);
          this.name = updatedName;
          this.cdr.detectChanges();
          this.toast.error('خطأ', err?.error?.message || 'تعذر حفظ البيانات في السيرفر.');
        },
      });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.toast.warning('تنبيه', 'يرجى اختيار ملف صورة صالح (.png, .jpg, .jpeg, .webp).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toast.warning('تنبيه', 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.');
      return;
    }

    this.uploadingAvatar.set(true);
    this.cdr.markForCheck();

    this.profileService.uploadAvatar(file).subscribe({
      next: (res) => {
        this.uploadingAvatar.set(false);
        if (res.success && res.profilePictureUrl) {
          this.avatarUrl.set(res.profilePictureUrl);
          this.toast.success('نجاح', res.message);
        } else {
          this.toast.error('خطأ', res.message);
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.uploadingAvatar.set(false);
        this.toast.error('خطأ', 'فشل رفع الصورة إلى السحابة.');
        this.cdr.markForCheck();
      },
    });
  }

  onUpdatePassword(): void {
    if (!this.currentPass || !this.newPass || !this.confirmPass) {
      this.toast.warning('تنبيه', 'يرجى ملء جميع حقول كلمة المرور.');
      return;
    }

    if (this.newPass.length < 8) {
      this.toast.warning('تنبيه', 'يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف وأرقام.');
      return;
    }

    if (!/[A-Z]/.test(this.newPass)) {
      this.toast.warning('تنبيه', 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل (A-Z).');
      return;
    }

    if (!/[0-9]/.test(this.newPass)) {
      this.toast.warning('تنبيه', 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل (0-9).');
      return;
    }

    if (this.newPass !== this.confirmPass) {
      this.toast.warning('تنبيه', 'كلمة المرور الجديدة غير متطابقة مع تأكيد كلمة المرور.');
      return;
    }

    this.saving.set(true);
    this.cdr.markForCheck();

    this.profileService.updatePassword(this.currentPass, this.newPass, this.confirmPass).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success) {
          this.currentPass = '';
          this.newPass = '';
          this.confirmPass = '';
          this.toast.success('نجاح', res.message);
        } else {
          this.toast.error('خطأ', res.message);
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.saving.set(false);
        this.cdr.markForCheck();
        this.toast.error('خطأ', err?.error?.message || err?.message || 'فشل تحديث كلمة المرور.');
      },
    });
  }

  get hasMinLength(): boolean {
    return this.newPass.length >= 8;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.newPass);
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.newPass);
  }

  get isPasswordMatching(): boolean {
    return !!(this.newPass && this.confirmPass && this.newPass === this.confirmPass);
  }
}
