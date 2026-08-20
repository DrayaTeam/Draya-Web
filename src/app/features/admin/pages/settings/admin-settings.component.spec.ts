import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminSettingsComponent } from './admin-settings.component';
import { AdminFinancialService } from '../../services/admin-financial.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { PlatformSettingsDto } from '../../models/admin-financial.model';

describe('AdminSettingsComponent', () => {
  let component: AdminSettingsComponent;
  let fixture: ComponentFixture<AdminSettingsComponent>;
  let financialServiceSpy: jasmine.SpyObj<AdminFinancialService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const mockSettings: PlatformSettingsDto = {
    aiExamPrice: 10,
    freeMonthlyAIExamQuota: 5,
    platformCommissionPercent: 12,
  };

  beforeEach(async () => {
    financialServiceSpy = jasmine.createSpyObj('AdminFinancialService', [
      'getSettings',
      'updateSettings',
    ]);
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info']);

    financialServiceSpy.getSettings.and.returnValue(of(mockSettings));
    financialServiceSpy.updateSettings.and.returnValue(of(mockSettings));

    await TestBed.configureTestingModule({
      imports: [AdminSettingsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: AdminFinancialService, useValue: financialServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the admin settings component', () => {
    expect(component).toBeTruthy();
  });

  it('should populate form with fetched settings on init', () => {
    expect(financialServiceSpy.getSettings).toHaveBeenCalled();
    expect(component.form.value.aiExamPrice).toBe(10);
    expect(component.form.value.freeMonthlyAIExamQuota).toBe(5);
    expect(component.form.value.platformCommissionPercent).toBe(12);
  });

  it('should open confirm modal on valid submit', () => {
    component.form.patchValue({ aiExamPrice: 15, platformCommissionPercent: 20 });
    component.onSubmit();
    expect(component.isConfirmOpen()).toBeTrue();
  });

  it('should submit updated settings when confirmed', () => {
    component.form.patchValue({
      aiExamPrice: 15,
      freeMonthlyAIExamQuota: 10,
      platformCommissionPercent: 20,
    });
    component.onConfirmSave();

    expect(financialServiceSpy.updateSettings).toHaveBeenCalledWith({
      aiExamPrice: 15,
      freeMonthlyAIExamQuota: 10,
      platformCommissionPercent: 20,
    });
    expect(toastSpy.success).toHaveBeenCalledWith('ADMIN.SETTINGS.SUCCESS');
    expect(component.isConfirmOpen()).toBeFalse();
  });

  it('should display error toast on update failure', () => {
    financialServiceSpy.updateSettings.and.returnValue(
      throwError(() => ({ error: { message: 'Update failed' } })),
    );
    component.onConfirmSave();
    expect(toastSpy.error).toHaveBeenCalledWith('Update failed');
    expect(component.isConfirmOpen()).toBeFalse();
  });
});
