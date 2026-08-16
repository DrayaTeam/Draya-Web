import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminSupervisorService } from '../../services/admin-supervisor.service';
import { AdminSupervisorDto } from '../../models/admin-supervisor.model';
import { ToastService } from '../../../../core/services/toast.service';
import {
  AdminDataTableComponent,
  AdminColumn,
} from '../../components/admin-data-table/admin-data-table.component';
import { AdminStatusBadgeComponent } from '../../components/admin-status-badge/admin-status-badge.component';
import { AdminConfirmDialogComponent } from '../../components/admin-confirm-dialog/admin-confirm-dialog.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'draya-admin-supervisors',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    AdminDataTableComponent,
    AdminStatusBadgeComponent,
    AdminConfirmDialogComponent,
  ],
  templateUrl: './admin-supervisors.component.html',
  styleUrls: ['./admin-supervisors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSupervisorsComponent implements OnInit {
  private readonly supervisorService = inject(AdminSupervisorService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly supervisors = signal<AdminSupervisorDto[]>([]);
  readonly loading = signal<boolean>(false);
  readonly totalCount = signal<number>(0);
  readonly searchQuery = signal<string>('');

  // Invite Modal State
  readonly isInviteModalOpen = signal<boolean>(false);
  readonly isInviting = signal<boolean>(false);

  // Status Toggle Dialog State
  readonly isStatusConfirmOpen = signal<boolean>(false);
  readonly selectedSupervisor = signal<AdminSupervisorDto | null>(null);

  readonly inviteForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // Column Templates
  readonly nameTpl = viewChild<TemplateRef<unknown>>('nameTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<AdminColumn<AdminSupervisorDto>[]>(() => [
    {
      key: 'name',
      headerKey: 'ADMIN.SUPERVISORS.COL_NAME',
      sortable: true,
      cellTemplate: this.nameTpl() as TemplateRef<{ $implicit: AdminSupervisorDto }>,
    },
    {
      key: 'email',
      headerKey: 'ADMIN.SUPERVISORS.COL_EMAIL',
      sortable: true,
    },
    {
      key: 'isActive',
      headerKey: 'ADMIN.SUPERVISORS.COL_STATUS',
      cellTemplate: this.statusTpl() as TemplateRef<{ $implicit: AdminSupervisorDto }>,
    },
    {
      key: 'createdAt',
      headerKey: 'ADMIN.SUPERVISORS.COL_ADDED_AT',
      sortable: true,
    },
    {
      key: 'actions',
      headerKey: 'ADMIN.SUPERVISORS.COL_ACTIONS',
      cellTemplate: this.actionsTpl() as TemplateRef<{ $implicit: AdminSupervisorDto }>,
    },
  ]);

  readonly filteredSupervisors = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.supervisors();
    return this.supervisors().filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    );
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.supervisorService
      .getSupervisors()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (items) => {
          this.supervisors.set(items || []);
          this.totalCount.set(items?.length || 0);
        },
      });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  openInviteModal(): void {
    this.inviteForm.reset();
    this.isInviteModalOpen.set(true);
  }

  closeInviteModal(): void {
    this.isInviteModalOpen.set(false);
  }

  sendInvite(): void {
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }

    this.isInviting.set(true);
    const formVal = this.inviteForm.value;

    this.supervisorService
      .inviteSupervisor({
        name: formVal.name!,
        email: formVal.email!,
        password: formVal.password!,
      })
      .pipe(finalize(() => this.isInviting.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('تم إرسال الدعوة للمشرف بنجاح');
          this.closeInviteModal();
          this.loadData();
        },
      });
  }

  promptToggleStatus(supervisor: AdminSupervisorDto): void {
    this.selectedSupervisor.set(supervisor);
    this.isStatusConfirmOpen.set(true);
  }

  onConfirmToggleStatus(): void {
    const sup = this.selectedSupervisor();
    if (!sup) return;

    const newStatus = !sup.isActive;
    this.supervisorService.toggleSupervisorStatus(sup.id, newStatus).subscribe({
      next: () => {
        const msg = newStatus ? 'تم تفعيل حساب المشرف' : 'تم تعطيل حساب المشرف';
        this.toast.success(msg);
        this.isStatusConfirmOpen.set(false);
        this.loadData();
      },
    });
  }
}
