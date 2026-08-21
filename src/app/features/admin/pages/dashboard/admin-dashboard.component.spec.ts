import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminFinancialService } from '../../services/admin-financial.service';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { FinancialOverviewDto } from '../../models/admin-financial.model';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let financialServiceSpy: jasmine.SpyObj<AdminFinancialService>;

  const mockOverview: FinancialOverviewDto = {
    totalClassroomRevenues: 125000,
    totalCommissionFees: 18750,
    totalTopUps: 45000,
    totalAiExamFees: 12000,
    totalEarnedTeacherBalance: 85000,
    totalPurchasedTeacherBalance: 33000,
    totalEarnedDue: 15000,
  };

  beforeEach(async () => {
    financialServiceSpy = jasmine.createSpyObj('AdminFinancialService', [
      'getOverview',
      'getWithdrawals',
    ]);
    financialServiceSpy.getOverview.and.returnValue(of(mockOverview));
    financialServiceSpy.getWithdrawals.and.returnValue(
      of({ items: [], totalCount: 3, pageNumber: 1, pageSize: 1 }),
    );

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: AdminFinancialService, useValue: financialServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the admin dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should load financial overview on init', () => {
    expect(financialServiceSpy.getOverview).toHaveBeenCalled();
    expect(component.overview()?.totalClassroomRevenues).toBe(125000);
    expect(component.overview()?.totalCommissionFees).toBe(18750);
    expect(component.loading()).toBeFalse();
  });

  it('should load pending withdrawals count on init', () => {
    expect(financialServiceSpy.getWithdrawals).toHaveBeenCalledWith({
      statusFilter: 'Pending',
      pageNumber: 1,
      pageSize: 1,
    });
    expect(component.pendingWithdrawalsCount()).toBe(3);
  });

  it('should fallback to zero values gracefully on API error', () => {
    financialServiceSpy.getOverview.and.returnValue(throwError(() => new Error('Server Error')));
    component.loadOverview();
    expect(component.overview()?.totalClassroomRevenues).toBe(0);
    expect(component.loading()).toBeFalse();
  });
});
