import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminWithdrawalsComponent } from './admin-withdrawals.component';
import { AdminFinancialService } from '../../services/admin-financial.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { WithdrawalDto } from '../../models/admin-financial.model';
import { WithdrawalStatus, PayoutAccountType } from '../../models/admin-enums';

describe('AdminWithdrawalsComponent', () => {
  let component: AdminWithdrawalsComponent;
  let fixture: ComponentFixture<AdminWithdrawalsComponent>;
  let financialServiceSpy: jasmine.SpyObj<AdminFinancialService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const mockWithdrawal: WithdrawalDto = {
    id: 'w-1',
    teacherName: 'أ. محمد طارق',
    teacherEmail: 'mohamed@example.com',
    amount: 5000,
    status: WithdrawalStatus.Pending,
    requestedAt: '2026-08-20T10:00:00Z',
    payoutAccount: {
      id: 'acc-1',
      accountType: PayoutAccountType.BankAccount,
      accountName: 'محمد طارق',
      accountIdentifier: 'EG12345678901234567890',
      isDefault: true,
    },
  };

  beforeEach(async () => {
    financialServiceSpy = jasmine.createSpyObj('AdminFinancialService', [
      'getWithdrawals',
      'approveWithdrawal',
      'rejectWithdrawal',
      'markWithdrawalPaid',
      'refundPaymentTransaction',
    ]);
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    financialServiceSpy.getWithdrawals.and.returnValue(
      of({ items: [mockWithdrawal], totalCount: 1, pageNumber: 1, pageSize: 10 }),
    );
    financialServiceSpy.approveWithdrawal.and.returnValue(of(void 0));
    financialServiceSpy.rejectWithdrawal.and.returnValue(of(void 0));
    financialServiceSpy.markWithdrawalPaid.and.returnValue(of(void 0));
    financialServiceSpy.refundPaymentTransaction.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [AdminWithdrawalsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: AdminFinancialService, useValue: financialServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminWithdrawalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the admin withdrawals component', () => {
    expect(component).toBeTruthy();
  });

  it('should load withdrawals on initialization', () => {
    expect(financialServiceSpy.getWithdrawals).toHaveBeenCalled();
    expect(component.withdrawals().length).toBe(1);
    expect(component.withdrawals()[0].teacherName).toBe('أ. محمد طارق');
  });

  it('should filter withdrawals when status tab changes', () => {
    component.setTab('Pending');
    expect(component.activeStatusTab()).toBe('Pending');
    expect(financialServiceSpy.getWithdrawals).toHaveBeenCalledWith({
      statusFilter: 'Pending',
      pageNumber: 1,
      pageSize: 10,
    });
  });

  it('should open and close withdrawal detail slide-over drawer', () => {
    component.openDetail(mockWithdrawal);
    expect(component.selectedWithdrawal()).toBe(mockWithdrawal);
    expect(component.isDetailOpen()).toBeTrue();

    component.closeDetail();
    expect(component.selectedWithdrawal()).toBeNull();
    expect(component.isDetailOpen()).toBeFalse();
  });

  it('should handle approve withdrawal flow successfully', () => {
    component.promptApprove(mockWithdrawal);
    expect(component.confirmApproveOpen()).toBeTrue();
    expect(component.actionTarget()).toBe(mockWithdrawal);

    component.onConfirmApprove();
    expect(financialServiceSpy.approveWithdrawal).toHaveBeenCalledWith('w-1');
    expect(toastSpy.success).toHaveBeenCalledWith('ADMIN.WITHDRAWALS.SUCCESS_APPROVED');
    expect(component.confirmApproveOpen()).toBeFalse();
  });

  it('should handle reject withdrawal flow with reason', () => {
    component.promptReject(mockWithdrawal);
    expect(component.confirmRejectOpen()).toBeTrue();

    component.onConfirmReject('البيانات البنكية غير متطابقة');
    expect(financialServiceSpy.rejectWithdrawal).toHaveBeenCalledWith(
      'w-1',
      'البيانات البنكية غير متطابقة',
    );
    expect(toastSpy.success).toHaveBeenCalledWith('ADMIN.WITHDRAWALS.SUCCESS_REJECTED');
    expect(component.confirmRejectOpen()).toBeFalse();
  });

  it('should handle mark paid flow with notes', () => {
    component.promptMarkPaid(mockWithdrawal);
    expect(component.confirmPaidOpen()).toBeTrue();

    component.paidAdminNote.set('تم التحويل عبر فودافون كاش');
    component.onConfirmMarkPaid();
    expect(financialServiceSpy.markWithdrawalPaid).toHaveBeenCalledWith(
      'w-1',
      'تم التحويل عبر فودافون كاش',
    );
    expect(toastSpy.success).toHaveBeenCalledWith('ADMIN.WITHDRAWALS.SUCCESS_PAID');
    expect(component.confirmPaidOpen()).toBeFalse();
  });

  it('should handle refund payment transaction flow successfully', () => {
    component.promptRefund(mockWithdrawal);
    expect(component.confirmRefundOpen()).toBeTrue();

    component.onConfirmRefund();
    expect(financialServiceSpy.refundPaymentTransaction).toHaveBeenCalledWith('w-1');
    expect(toastSpy.success).toHaveBeenCalledWith(
      'تم استرجاع المعاملة المالية بنجاح وإعادتها لحساب المعلم/المستخدم.',
    );
    expect(component.confirmRefundOpen()).toBeFalse();
  });

  it('should handle API errors gracefully during approval', () => {
    financialServiceSpy.approveWithdrawal.and.returnValue(
      throwError(() => ({ error: { message: 'رصيد غير كافٍ' } })),
    );
    component.promptApprove(mockWithdrawal);
    component.onConfirmApprove();
    expect(toastSpy.error).toHaveBeenCalledWith('رصيد غير كافٍ');
    expect(component.confirmApproveOpen()).toBeFalse();
  });
});
