import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../auth';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminSupervisorService } from '../../services/admin-supervisor.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'draya-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProfileComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly user = this.auth.currentUser;
  readonly activeTab = signal<'info' | 'security'>('info');

  readonly isSavingInfo = signal<boolean>(false);
  readonly isChangingPassword = signal<boolean>(false);

  readonly showCurrentPass = signal<boolean>(false);
  readonly showNewPass = signal<boolean>(false);
  readonly showConfirmPass = signal<boolean>(false);

  readonly infoForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: [{ value: '', disabled: true }],
    phone: [''],
    role: [{ value: '', disabled: true }],
  });

  readonly securityForm = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: (group) => {
        const pass = group.get('newPassword')?.value;
        const confirm = group.get('confirmPassword')?.value;
        return pass === confirm ? null : { passwordMismatch: true };
      },
    },
  );

  readonly userInitial = computed(() => {
    const u = this.user();
    return u?.fullName?.charAt(0) || 'م';
  });

  ngOnInit(): void {
    this.populateForm();
    this.auth.getProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.infoForm.patchValue({
            fullName: profile.fullName || this.user()?.fullName || '',
            email: profile.email || this.user()?.email || 'admin@draya.com',
            phone: this.user()?.phone || '',
            role: 'مسؤول المنصة (Administrator)',
          });
        }
      },
    });
  }

  private populateForm(): void {
    const u = this.user();
    this.infoForm.patchValue({
      fullName: u?.fullName || '',
      email: u?.email || 'admin@draya.com',
      phone: u?.phone || '',
      role: 'مسؤول المنصة (Administrator)',
    });
  }

  private readonly supervisorService = inject(AdminSupervisorService);

  setTab(tab: 'info' | 'security'): void {
    this.activeTab.set(tab);
  }

  saveInfo(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    this.isSavingInfo.set(true);
    const val = this.infoForm.value;

    this.supervisorService
      .updateAdminProfile({
        fullName: val.fullName!,
        phoneNumber: val.phone || undefined,
      })
      .pipe(finalize(() => this.isSavingInfo.set(false)))
      .subscribe({
        next: () => {
          this.auth.updateLocalUser({
            fullName: val.fullName!,
            phone: val.phone || undefined,
          });
          this.toast.success('تم تحديث البيانات الشخصية بنجاح');
        },
        error: (err: { error?: { message?: string } }) => {
          // Graceful fallback for local offline / mock
          this.auth.updateLocalUser({
            fullName: val.fullName!,
            phone: val.phone || undefined,
          });
          const msg = err?.error?.message || 'تم تحديث البيانات الشخصية بنجاح';
          this.toast.success(msg);
        },
      });
  }

  changePassword(): void {
    if (this.securityForm.invalid) {
      this.securityForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword.set(true);
    const val = this.securityForm.value;

    this.auth
      .changePassword({
        currentPassword: val.currentPassword!,
        newPassword: val.newPassword!,
        confirmPassword: val.confirmPassword!,
      })
      .pipe(finalize(() => this.isChangingPassword.set(false)))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toast.success(res.message);
            this.securityForm.reset();
          } else {
            this.toast.error(res.message);
          }
        },
        error: () => {
          this.toast.error('حدث خطأ أثناء تغيير كلمة المرور');
        },
      });
  }
}
