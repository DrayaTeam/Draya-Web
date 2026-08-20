import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAdjustmentsComponent } from './admin-adjustments.component';
import { AdminFinancialService } from '../../services/admin-financial.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { WalletBalanceType } from '../../models/admin-enums';

describe('AdminAdjustmentsComponent', () => {
  let component: AdminAdjustmentsComponent;
  let fixture: ComponentFixture<AdminAdjustmentsComponent>;
  let financialServiceSpy: jasmine.SpyObj<AdminFinancialService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    financialServiceSpy = jasmine.createSpyObj('AdminFinancialService', [
      'searchTeachers',
      'getTeachers',
      'createAdjustment',
    ]);
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    financialServiceSpy.searchTeachers.and.returnValue(
      of([
        {
          id: 't-1',
          name: 'أ. حسام الدين',
          fullName: 'أ. حسام الدين',
          email: 'hossam@example.com',
          earnedBalance: 12000,
          purchasedBalance: 3000,
        },
      ]),
    );
    financialServiceSpy.createAdjustment.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [AdminAdjustmentsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: AdminFinancialService, useValue: financialServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminAdjustmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the admin adjustments component', () => {
    expect(component).toBeTruthy();
  });

  it('should load teachers list on initialization', () => {
    expect(financialServiceSpy.searchTeachers).toHaveBeenCalled();
    expect(component.teachers().length).toBe(1);
    expect(component.teachers()[0].name).toBe('أ. حسام الدين');
  });

  it('should validate form and show error toast when submitting invalid form', () => {
    component.onSubmit();
    expect(component.form.valid).toBeFalse();
    expect(component.isConfirmOpen()).toBeFalse();
  });

  it('should open confirmation dialog on valid form submission', () => {
    component.form.patchValue({
      teacherId: 't-1',
      balanceType: WalletBalanceType.Earned,
      amount: 1500,
      adjustmentDirection: 'credit',
      reason: 'مكافأة تميز في إنتاج المحتوى التعليمي',
    });

    component.onSubmit();
    expect(component.form.valid).toBeTrue();
    expect(component.isConfirmOpen()).toBeTrue();
  });

  it('should handle positive credit adjustment successfully', () => {
    component.form.patchValue({
      teacherId: 't-1',
      balanceType: WalletBalanceType.Earned,
      amount: 1500,
      adjustmentDirection: 'credit',
      reason: 'مكافأة أداء تعليمي',
    });

    component.onConfirmAdjustment();
    expect(financialServiceSpy.createAdjustment).toHaveBeenCalledWith({
      teacherId: 't-1',
      balanceType: WalletBalanceType.Earned,
      amount: 1500,
      reason: 'مكافأة أداء تعليمي',
    });
    expect(toastSpy.success).toHaveBeenCalledWith('ADMIN.ADJUSTMENTS.SUCCESS');
  });

  it('should handle negative debit adjustment successfully', () => {
    component.form.patchValue({
      teacherId: 't-1',
      balanceType: WalletBalanceType.Purchased,
      amount: 500,
      adjustmentDirection: 'debit',
      reason: 'تسوية خصم رسوم مستردة',
    });

    component.onConfirmAdjustment();
    expect(financialServiceSpy.createAdjustment).toHaveBeenCalledWith({
      teacherId: 't-1',
      balanceType: WalletBalanceType.Purchased,
      amount: -500,
      reason: 'تسوية خصم رسوم مستردة',
    });
    expect(toastSpy.success).toHaveBeenCalledWith('ADMIN.ADJUSTMENTS.SUCCESS');
  });

  it('should handle API error during adjustment', () => {
    financialServiceSpy.createAdjustment.and.returnValue(
      throwError(() => ({ error: { message: 'المعلم غير موجود' } })),
    );

    component.form.patchValue({
      teacherId: 't-1',
      balanceType: WalletBalanceType.Earned,
      amount: 1000,
      adjustmentDirection: 'credit',
      reason: 'مكافأة شهرية للمدرس',
    });

    component.onConfirmAdjustment();
    expect(toastSpy.error).toHaveBeenCalledWith('المعلم غير موجود');
  });
});
