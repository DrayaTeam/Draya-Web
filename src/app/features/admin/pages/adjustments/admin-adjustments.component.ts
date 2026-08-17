import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminFinancialService } from '../../services/admin-financial.service';
import { WalletBalanceType } from '../../models/admin-enums';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminConfirmDialogComponent } from '../../components/admin-confirm-dialog/admin-confirm-dialog.component';
import { finalize } from 'rxjs/operators';

interface TeacherOption {
  id: string;
  name: string;
  email: string;
}

@Component({
  selector: 'draya-admin-adjustments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    AdminConfirmDialogComponent,
  ],
  templateUrl: './admin-adjustments.component.html',
  styleUrls: ['./admin-adjustments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAdjustmentsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly financialService = inject(AdminFinancialService);
  private readonly toast = inject(ToastService);

  readonly WalletBalanceType = WalletBalanceType;

  // Real teacher options from GET /api/v1/teachers
  readonly teachers = signal<TeacherOption[]>([]);
  readonly loadingTeachers = signal<boolean>(false);

  readonly form = this.fb.group({
    teacherId: ['', Validators.required],
    balanceType: [WalletBalanceType.Earned, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    adjustmentDirection: ['credit', Validators.required], // credit (+) or debit (-)
    reason: ['', [Validators.required, Validators.minLength(5)]],
  });

  readonly isSubmitting = signal<boolean>(false);
  readonly isConfirmOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.loadingTeachers.set(true);
    this.financialService
      .getTeachers()
      .pipe(finalize(() => this.loadingTeachers.set(false)))
      .subscribe({
        next: (list) => {
          if (Array.isArray(list)) {
            const mapped: TeacherOption[] = list.map((t) => ({
              id: t.userId || t.id || '',
              name: t.fullName || t.name || t.email || 'معلم',
              email: t.email || '',
            }));
            this.teachers.set(mapped);
          } else {
            this.teachers.set([]);
          }
        },
        error: () => {
          this.teachers.set([]);
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isConfirmOpen.set(true);
  }

  onConfirmAdjustment(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const val = this.form.value;
    const rawAmount = Number(val.amount);
    const finalAmount =
      val.adjustmentDirection === 'debit' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

    this.financialService
      .createAdjustment({
        teacherId: val.teacherId!,
        balanceType: val.balanceType as WalletBalanceType,
        amount: finalAmount,
        reason: val.reason!,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('ADMIN.ADJUSTMENTS.SUCCESS');
          this.isConfirmOpen.set(false);
          this.form.reset({
            teacherId: '',
            balanceType: WalletBalanceType.Earned,
            amount: null,
            adjustmentDirection: 'credit',
            reason: '',
          });
        },
        error: (err) => {
          const msg = err?.error?.message || 'فشلت عملية تسوية الرصيد';
          this.toast.error(msg);
          this.isConfirmOpen.set(false);
        },
      });
  }
}
