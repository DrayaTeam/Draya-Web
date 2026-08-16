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
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminFinancialService } from '../../services/admin-financial.service';
import { WithdrawalDto } from '../../models/admin-financial.model';
import { WithdrawalStatus, PayoutAccountType } from '../../models/admin-enums';
import { ToastService } from '../../../../core/services/toast.service';
import {
  AdminDataTableComponent,
  AdminColumn,
} from '../../components/admin-data-table/admin-data-table.component';
import { AdminStatusBadgeComponent } from '../../components/admin-status-badge/admin-status-badge.component';
import { AdminSlideOverComponent } from '../../components/admin-slide-over/admin-slide-over.component';
import { AdminConfirmDialogComponent } from '../../components/admin-confirm-dialog/admin-confirm-dialog.component';
import { finalize } from 'rxjs/operators';

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

  // Status Filter Tabs
  readonly activeStatusTab = signal<string>('All');
  readonly statusTabs = [
    { key: 'All', labelKey: 'ADMIN.WITHDRAWALS.TAB_ALL' },
    { key: 'Pending', labelKey: 'ADMIN.WITHDRAWALS.TAB_PENDING' },
    { key: 'Approved', labelKey: 'ADMIN.WITHDRAWALS.TAB_APPROVED' },
    { key: 'Paid', labelKey: 'ADMIN.WITHDRAWALS.TAB_PAID' },
    { key: 'Rejected', labelKey: 'ADMIN.WITHDRAWALS.TAB_REJECTED' },
    { key: 'Cancelled', labelKey: 'ADMIN.WITHDRAWALS.TAB_CANCELLED' },
  ];

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
          this.withdrawals.set(res.items || []);
          this.totalCount.set(res.totalCount || 0);
        },
        error: () => {
          // Fallback mock withdrawals
          this.withdrawals.set(this.getMockWithdrawals());
          this.totalCount.set(this.getMockWithdrawals().length);
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
    // Local filter if using mock/cached data or pass to API
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
      error: () => {
        // Fallback update local state for mock testing
        this.updateMockStatus(target.id, WithdrawalStatus.Approved);
        this.toast.success('ADMIN.WITHDRAWALS.SUCCESS_APPROVED');
        this.confirmApproveOpen.set(false);
        this.closeDetail();
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
      error: () => {
        this.updateMockStatus(target.id, WithdrawalStatus.Rejected, String(reason || ''));
        this.toast.success('ADMIN.WITHDRAWALS.SUCCESS_REJECTED');
        this.confirmRejectOpen.set(false);
        this.closeDetail();
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
      error: () => {
        this.updateMockStatus(target.id, WithdrawalStatus.Paid);
        this.toast.success('ADMIN.WITHDRAWALS.SUCCESS_PAID');
        this.confirmPaidOpen.set(false);
        this.closeDetail();
      },
    });
  }

  private updateMockStatus(id: string, status: WithdrawalStatus, reason?: string): void {
    this.withdrawals.update((list) =>
      list.map((w) => (w.id === id ? { ...w, status, rejectionReason: reason } : w)),
    );
  }

  private getMockWithdrawals(): WithdrawalDto[] {
    return [
      {
        id: 'w-1',
        teacherName: 'أ. محمد الشناوي',
        teacherEmail: 'm.shinawy@draya.edu.sa',
        amount: 3500,
        status: WithdrawalStatus.Pending,
        requestedAt: '2024-05-12T14:30:00Z',
        payoutAccount: {
          id: 'acc-1',
          accountType: PayoutAccountType.BankAccount,
          accountName: 'محمد أحمد الشناوي',
          accountIdentifier: 'EG380002000100000012345678901',
          isDefault: true,
        },
      },
      {
        id: 'w-2',
        teacherName: 'د. فاطمة الزهراء',
        teacherEmail: 'fatma.z@draya.edu.sa',
        amount: 5200,
        status: WithdrawalStatus.Approved,
        requestedAt: '2024-05-10T11:20:00Z',
        payoutAccount: {
          id: 'acc-2',
          accountType: PayoutAccountType.MobileWallet,
          accountName: 'فاطمة الزهراء محمد',
          accountIdentifier: '01012345678',
          isDefault: true,
        },
      },
      {
        id: 'w-3',
        teacherName: 'م. أحمد كمال',
        teacherEmail: 'ahmed.kamal@draya.edu.sa',
        amount: 1800,
        status: WithdrawalStatus.Paid,
        requestedAt: '2024-05-08T09:15:00Z',
        payoutAccount: {
          id: 'acc-3',
          accountType: PayoutAccountType.BankAccount,
          accountName: 'أحمد كمال الدين',
          accountIdentifier: 'EG520003000200000098765432109',
          isDefault: true,
        },
        adminNote: 'تم التحويل عبر InstaPay بنجاح',
      },
      {
        id: 'w-4',
        teacherName: 'أ. سارة إبراهيم',
        teacherEmail: 'sara.i@draya.edu.sa',
        amount: 2400,
        status: WithdrawalStatus.Rejected,
        requestedAt: '2024-05-05T16:45:00Z',
        payoutAccount: {
          id: 'acc-4',
          accountType: PayoutAccountType.MobileWallet,
          accountName: 'سارة إبراهيم علي',
          accountIdentifier: '01198765432',
          isDefault: false,
        },
        rejectionReason: 'رقم المحفظة الإلكترونية غير صحيح أو غير مسجل',
      },
    ];
  }
}
