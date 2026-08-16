import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
  viewChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminFinancialService } from '../../services/admin-financial.service';
import { WithdrawalDto } from '../../models/admin-financial.model';
import { WithdrawalStatus, PayoutAccountType } from '../../models/admin-enums';
import {
  AdminDataTableComponent,
  AdminColumn,
} from '../../components/admin-data-table/admin-data-table.component';
import { AdminStatusBadgeComponent } from '../../components/admin-status-badge/admin-status-badge.component';
import { AdminSlideOverComponent } from '../../components/admin-slide-over/admin-slide-over.component';
import { AdminConfirmDialogComponent } from '../../components/admin-confirm-dialog/admin-confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';
import { finalize } from 'rxjs/operators';

interface StatusTab {
  key: string;
  labelKey: string;
}

@Component({
  selector: 'draya-admin-withdrawals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    AdminDataTableComponent,
    AdminStatusBadgeComponent,
    AdminSlideOverComponent,
    AdminConfirmDialogComponent,
  ],
  templateUrl: './admin-withdrawals.component.html',
  styleUrls: ['./admin-withdrawals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminWithdrawalsComponent implements OnInit {
  private readonly financialService = inject(AdminFinancialService);
  private readonly toast = inject(ToastService);

  readonly WithdrawalStatus = WithdrawalStatus;
  readonly PayoutAccountType = PayoutAccountType;

  readonly statusTabs: StatusTab[] = [
    { key: 'All', labelKey: 'ADMIN.WITHDRAWALS.TAB_ALL' },
    { key: 'Pending', labelKey: 'ADMIN.WITHDRAWALS.TAB_PENDING' },
    { key: 'Approved', labelKey: 'ADMIN.WITHDRAWALS.TAB_APPROVED' },
    { key: 'Paid', labelKey: 'ADMIN.WITHDRAWALS.TAB_PAID' },
    { key: 'Rejected', labelKey: 'ADMIN.WITHDRAWALS.TAB_REJECTED' },
    { key: 'Cancelled', labelKey: 'ADMIN.WITHDRAWALS.TAB_CANCELLED' },
  ];

  readonly activeStatusTab = signal<string>('All');

  isPending(status: unknown): boolean {
    if (status === null || status === undefined) return false;
    return (
      status === WithdrawalStatus.Pending ||
      status === 0 ||
      status === '0' ||
      String(status).toLowerCase() === 'pending'
    );
  }

  isApproved(status: unknown): boolean {
    if (status === null || status === undefined) return false;
    return (
      status === WithdrawalStatus.Approved ||
      status === 1 ||
      status === '1' ||
      String(status).toLowerCase() === 'approved'
    );
  }

  isBankAccount(type: unknown): boolean {
    if (type === null || type === undefined) return false;
    return (
      type === PayoutAccountType.BankAccount ||
      type === 0 ||
      type === '0' ||
      String(type).toLowerCase() === 'bankaccount' ||
      String(type).toLowerCase() === 'banktransfer'
    );
  }

  isMobileWallet(type: unknown): boolean {
    if (type === null || type === undefined) return false;
    return (
      type === PayoutAccountType.MobileWallet ||
      type === 1 ||
      type === '1' ||
      String(type).toLowerCase() === 'mobilewallet' ||
      String(type).toLowerCase() === 'vodafonecash'
    );
  }

  // Table State
  readonly withdrawals = signal<WithdrawalDto[]>([]);
  readonly loading = signal<boolean>(false);
  readonly totalCount = signal<number>(0);
  readonly pageNumber = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly searchQuery = signal<string>('');

  // Drawer Detail State
  readonly selectedWithdrawal = signal<WithdrawalDto | null>(null);
  readonly isDetailOpen = signal<boolean>(false);

  // Dialog State
  readonly confirmApproveOpen = signal<boolean>(false);
  readonly confirmRejectOpen = signal<boolean>(false);
  readonly confirmPaidOpen = signal<boolean>(false);
  readonly actionTarget = signal<WithdrawalDto | null>(null);
  readonly paidAdminNote = signal<string>('');

  // Column Cell Templates
  readonly teacherTpl = viewChild<TemplateRef<unknown>>('teacherTpl');
  readonly amountTpl = viewChild<TemplateRef<unknown>>('amountTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<AdminColumn<WithdrawalDto>[]>(() => [
    {
      key: 'teacher',
      headerKey: 'ADMIN.WITHDRAWALS.COL_TEACHER',
      sortable: true,
      cellTemplate: this.teacherTpl() as TemplateRef<{ $implicit: WithdrawalDto }>,
    },
    {
      key: 'amount',
      headerKey: 'ADMIN.WITHDRAWALS.COL_AMOUNT',
      sortable: true,
      cellTemplate: this.amountTpl() as TemplateRef<{ $implicit: WithdrawalDto }>,
    },
    {
      key: 'status',
      headerKey: 'ADMIN.WITHDRAWALS.COL_STATUS',
      cellTemplate: this.statusTpl() as TemplateRef<{ $implicit: WithdrawalDto }>,
    },
    {
      key: 'requestedAt',
      headerKey: 'ADMIN.WITHDRAWALS.COL_DATE',
      sortable: true,
    },
    {
      key: 'actions',
      headerKey: 'ADMIN.WITHDRAWALS.COL_ACTIONS',
      cellTemplate: this.actionsTpl() as TemplateRef<{ $implicit: WithdrawalDto }>,
    },
  ]);

  ngOnInit(): void {
    this.loadWithdrawals();
  }

  loadWithdrawals(): void {
    this.loading.set(true);
    const filter = this.activeStatusTab() === 'All' ? undefined : this.activeStatusTab();

    this.financialService
      .getWithdrawals({
        statusFilter: filter,
        pageNumber: this.pageNumber(),
        pageSize: this.pageSize(),
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.withdrawals.set(res?.items ?? []);
          this.totalCount.set(res?.totalCount ?? 0);
        },
        error: () => {
          this.withdrawals.set([]);
          this.totalCount.set(0);
        },
      });
  }

  setTab(tabKey: string): void {
    this.activeStatusTab.set(tabKey);
    this.pageNumber.set(1);
    this.loadWithdrawals();
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadWithdrawals();
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  openDetail(withdrawal: WithdrawalDto): void {
    this.selectedWithdrawal.set(withdrawal);
    this.isDetailOpen.set(true);
  }

  closeDetail(): void {
    this.isDetailOpen.set(false);
    this.selectedWithdrawal.set(null);
  }

  // Action Triggers
  promptApprove(withdrawal: WithdrawalDto): void {
    this.actionTarget.set(withdrawal);
    this.confirmApproveOpen.set(true);
  }

  promptReject(withdrawal: WithdrawalDto): void {
    this.actionTarget.set(withdrawal);
    this.confirmRejectOpen.set(true);
  }

  promptMarkPaid(withdrawal: WithdrawalDto): void {
    this.actionTarget.set(withdrawal);
    this.paidAdminNote.set('');
    this.confirmPaidOpen.set(true);
  }

  // Confirmation Handlers
  onConfirmApprove(): void {
    const target = this.actionTarget();
    if (!target) return;

    this.financialService.approveWithdrawal(target.id).subscribe({
      next: () => {
        this.toast.success('ADMIN.WITHDRAWALS.SUCCESS_APPROVED');
        this.confirmApproveOpen.set(false);
        this.closeDetail();
        this.loadWithdrawals();
      },
      error: (err) => {
        const msg = err?.error?.message || 'فشلت عملية الموافقة على طلب السحب';
        this.toast.error(msg);
        this.confirmApproveOpen.set(false);
      },
    });
  }

  onConfirmReject(reason: string | void): void {
    const target = this.actionTarget();
    if (!target) return;

    this.financialService.rejectWithdrawal(target.id, String(reason || '')).subscribe({
      next: () => {
        this.toast.success('ADMIN.WITHDRAWALS.SUCCESS_REJECTED');
        this.confirmRejectOpen.set(false);
        this.closeDetail();
        this.loadWithdrawals();
      },
      error: (err) => {
        const msg = err?.error?.message || 'فشلت عملية رفض طلب السحب';
        this.toast.error(msg);
        this.confirmRejectOpen.set(false);
      },
    });
  }

  onConfirmMarkPaid(): void {
    const target = this.actionTarget();
    if (!target) return;

    this.financialService.markWithdrawalPaid(target.id, this.paidAdminNote()).subscribe({
      next: () => {
        this.toast.success('ADMIN.WITHDRAWALS.SUCCESS_PAID');
        this.confirmPaidOpen.set(false);
        this.closeDetail();
        this.loadWithdrawals();
      },
      error: (err) => {
        const msg = err?.error?.message || 'فشلت عملية تعليم السحب كمدفوع';
        this.toast.error(msg);
        this.confirmPaidOpen.set(false);
      },
    });
  }
}
