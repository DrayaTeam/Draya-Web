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

  // Form Models initialized directly from logged-in session
  name = this.auth.currentUser()?.fullName || '';
  email = this.auth.currentUser()?.email || '';
  phone = this.auth.currentUser()?.phone || '';
  grade = 'الصف الثالث الثانوي - علمي رياضة';
  parentName = '';
  parentPhone = '';
  parentEmail = '';

  currentPass = '';
  newPass = '';

  ngOnInit(): void {
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
    const updatedParentEmail = this.parentEmail.trim();

    if (!updatedName) {
      this.toast.warning('تنبيه', 'يرجى إدخال اسم الطالب.');
      return;
    }

    this.saving.set(true);
    this.cdr.markForCheck();

    this.profileService
      .updateProfile({
        fullName: updatedName,
        parentGuardianEmail: updatedParentEmail,
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.name = updatedName;
          this.parentEmail = updatedParentEmail;
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

  onUpdatePassword(): void {
    if (!this.currentPass || !this.newPass) {
      this.toast.warning('تنبيه', 'يرجى إدخال كلمة المرور الحالية والجديدة.');
      return;
    }

    if (this.newPass.length < 6) {
      this.toast.warning('تنبيه', 'يجب ألا تقل كلمة المرور الجديدة عن 6 أحرف/أرقام.');
      return;
    }

    this.saving.set(true);
    this.cdr.markForCheck();

    this.profileService.updatePassword(this.currentPass, this.newPass).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.currentPass = '';
        this.newPass = '';
        this.cdr.markForCheck();
        this.toast.success('نجاح', res.message);
      },
      error: () => {
        this.saving.set(false);
        this.cdr.markForCheck();
        this.toast.error('خطأ', 'فشل تحديث كلمة المرور.');
      },
    });
  }

  onChangeAvatar(): void {
    this.toast.info('الصورة الشخصية', 'يمكنك اختيار صورة جديدة قريباً.');
  }
}
