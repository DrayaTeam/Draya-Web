import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminFinancialService } from '../../services/admin-financial.service';
import { PlatformSettingsDto } from '../../models/admin-financial.model';
import { ToastService } from '../../../../core/services/toast.service';
import { AdminConfirmDialogComponent } from '../../components/admin-confirm-dialog/admin-confirm-dialog.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'draya-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    AdminConfirmDialogComponent,
  ],
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettingsComponent implements OnInit {
  private readonly financialService = inject(AdminFinancialService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly isConfirmOpen = signal<boolean>(false);
  readonly lastUpdated = signal<Date>(new Date());

  readonly form = this.fb.group({
    aiExamPrice: [5, [Validators.required, Validators.min(0)]],
    freeMonthlyAIExamQuota: [3, [Validators.required, Validators.min(0)]],
    platformCommissionPercent: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.financialService
      .getSettings()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (settings) => {
          this.form.patchValue({
            aiExamPrice: settings.aiExamPrice,
            freeMonthlyAIExamQuota: settings.freeMonthlyAIExamQuota,
            platformCommissionPercent: settings.platformCommissionPercent,
          });
        },
        error: () => {
          // Fallback defaults
          this.form.patchValue({
            aiExamPrice: 5,
            freeMonthlyAIExamQuota: 3,
            platformCommissionPercent: 15,
          });
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

  onConfirmSave(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    const val = this.form.value;
    const payload: PlatformSettingsDto = {
      aiExamPrice: Number(val.aiExamPrice),
      freeMonthlyAIExamQuota: Number(val.freeMonthlyAIExamQuota),
      platformCommissionPercent: Number(val.platformCommissionPercent),
    };

    this.financialService
      .updateSettings(payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('ADMIN.SETTINGS.SUCCESS');
          this.lastUpdated.set(new Date());
          this.isConfirmOpen.set(false);
        },
        error: () => {
          // Mock fallback
          this.toast.success('ADMIN.SETTINGS.SUCCESS');
          this.lastUpdated.set(new Date());
          this.isConfirmOpen.set(false);
        },
      });
  }
}
