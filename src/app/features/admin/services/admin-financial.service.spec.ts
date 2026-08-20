import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminFinancialService } from './admin-financial.service';
import { WalletBalanceType, WithdrawalStatus } from '../models/admin-enums';

describe('AdminFinancialService', () => {
  let service: AdminFinancialService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminFinancialService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminFinancialService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get overview', () => {
    service.getOverview().subscribe((res) => {
      expect(res.totalClassroomRevenues).toBe(1000);
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/financial/overview'));
    expect(req.request.method).toBe('GET');
    req.flush({ totalClassroomRevenues: 1000 });
  });

  it('should get withdrawals with params', () => {
    service
      .getWithdrawals({ statusFilter: 'Pending', pageNumber: 1, pageSize: 10 })
      .subscribe((res) => {
        expect(res.items.length).toBe(1);
      });

    const req = httpMock.expectOne(
      (r) => r.url.endsWith('/admin/financial/withdrawals') && r.params.has('statusFilter'),
    );
    expect(req.request.method).toBe('GET');
    req.flush({ items: [{ id: '1', status: WithdrawalStatus.Pending }], totalCount: 1 });
  });

  it('should approve withdrawal', () => {
    service.approveWithdrawal('w-1').subscribe();
    const req = httpMock.expectOne((r) =>
      r.url.endsWith('/admin/financial/withdrawals/w-1/approve'),
    );
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('should reject withdrawal with reason', () => {
    service.rejectWithdrawal('w-1', 'Invalid account').subscribe();
    const req = httpMock.expectOne((r) =>
      r.url.endsWith('/admin/financial/withdrawals/w-1/reject'),
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ rejectionReason: 'Invalid account' });
    req.flush(null);
  });

  it('should create adjustment', () => {
    service
      .createAdjustment({
        teacherId: 't-1',
        amount: 500,
        balanceType: WalletBalanceType.Earned,
        reason: 'Bonus',
      })
      .subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/financial/adjustments'));
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('should get settings', () => {
    service.getSettings().subscribe((res) => {
      expect(res.platformCommissionPercent).toBe(15);
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/financial/settings'));
    expect(req.request.method).toBe('GET');
    req.flush({ platformCommissionPercent: 15 });
  });

  it('should search teachers with query', () => {
    service.searchTeachers('ahmed').subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].name).toBe('Ahmed');
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/teachers/search'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('ahmed');
    req.flush([
      {
        id: '1',
        name: 'Ahmed',
        fullName: 'Ahmed',
        email: 'a@a.com',
        earnedBalance: 100,
        purchasedBalance: 50,
      },
    ]);
  });

  it('should refund payment transaction', () => {
    service.refundPaymentTransaction('pay-123').subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/payments/pay-123/refund'));
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('should get financial adjustments audit records with query params', () => {
    service.getAdjustments({ teacherId: 't-123', pageNumber: 1, pageSize: 10 }).subscribe((res) => {
      expect(res.items.length).toBe(1);
      expect(res.items[0].transactionId).toBe('tx-1');
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/financial/adjustments'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('teacherId')).toBe('t-123');
    req.flush({
      items: [
        {
          transactionId: 'tx-1',
          teacherId: 't-123',
          amount: 500,
          balanceType: 'Earned',
          description: 'Bonus',
          createdAt: '2026-08-20T00:00:00Z',
        },
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 10,
    });
  });
});
