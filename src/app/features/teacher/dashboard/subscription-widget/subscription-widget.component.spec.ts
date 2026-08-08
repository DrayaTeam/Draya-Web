import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslatePipe } from '@ngx-translate/core';
import { SubscriptionWidgetComponent } from './subscription-widget.component';
import { SubscriptionPlan, QuotaItem } from '../../../../core/models/subscription.model';

describe('SubscriptionWidgetComponent', () => {
  let component: SubscriptionWidgetComponent;
  let fixture: ComponentFixture<SubscriptionWidgetComponent>;

  const mockPlan: SubscriptionPlan = {
    id: 'sub-test',
    planName: 'الخطة الاحترافية',
    tier: 'pro',
    price: 399,
    billingCycle: 'monthly',
    status: 'active',
    renewDate: '2026-08-20',
    limits: {
      maxClassrooms: 15,
      maxStudents: 500,
      maxExamGenerations: 20,
      maxStorageMB: 10240,
    },
  };

  const mockQuotas: QuotaItem[] = [
    {
      type: 'students',
      labelKey: 'SUBSCRIPTION.QUOTAS.STUDENTS',
      used: 410,
      max: 500,
      unitKey: 'SUBSCRIPTION.UNITS.STUDENTS',
      percentage: 82,
      isWarning: true,
      isDanger: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionWidgetComponent, TranslatePipe],
      providers: [provideRouter([]), provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionWidgetComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('plan', mockPlan);
    fixture.componentRef.setInput('quotas', mockQuotas);
    fixture.detectChanges();
  });

  it('should create and render inputs', () => {
    expect(component).toBeTruthy();
    expect(component.plan()?.id).toBe('sub-test');
    expect(component.quotas().length).toBe(1);
    expect(component.isNearLimit()).toBeTrue();
  });

  it('should toggle compare modal open and closed', () => {
    expect(component.showCompareModal()).toBeFalse();
    component.openCompareModal();
    expect(component.showCompareModal()).toBeTrue();
    component.closeCompareModal();
    expect(component.showCompareModal()).toBeFalse();
  });

  it('should emit cancelSub event when onCancelSub is called', () => {
    spyOn(component.cancelSub, 'emit');
    component.onCancelSub();
    expect(component.cancelSub.emit).toHaveBeenCalled();
  });

  it('should emit manageBilling event when onManageBilling is called', () => {
    spyOn(component.manageBilling, 'emit');
    component.onManageBilling();
    expect(component.manageBilling.emit).toHaveBeenCalled();
  });
});
