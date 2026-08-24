// src/app/features/teacher/exams/generate-exam/generate-exam.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { GenerateExamComponent } from './generate-exam.component';
import { AIExamQuotaDto } from '../../../../core/models/exam-generation.model';

function makeQuota(overrides: Partial<AIExamQuotaDto> = {}): AIExamQuotaDto {
  return {
    freeMonthlyQuota: 5,
    freeExamsUsed: 5,
    remainingFreeQuota: 0,
    aiExamPrice: 20,
    hasSufficientBalanceForPaid: false,
    ...overrides,
  };
}

describe('GenerateExamComponent', () => {
  let component: GenerateExamComponent;
  let fixture: ComponentFixture<GenerateExamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateExamComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    // Deliberately not calling fixture.detectChanges() here: ngOnInit fires
    // several HTTP calls (classrooms, wallet balance, quota) that are
    // irrelevant to the quota-gating logic under test below.
    fixture = TestBed.createComponent(GenerateExamComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not block generation when remainingFreeQuota is available', () => {
    // Regression test: the quota fields were previously named
    // remainingFreeExams/hasSufficientBalance/freeExamsUsedThisMonth in the
    // frontend model, none of which exist on the real AIExamQuotaDto
    // (confirmed via swagger: remainingFreeQuota/hasSufficientBalanceForPaid/
    // freeExamsUsed). Reading the wrong names meant remainingFreeQuota always
    // read as undefined, so a teacher with free quota remaining was always
    // treated as having none and routed into the paid-balance check instead.
    component.quota.set(makeQuota({ remainingFreeQuota: 3, freeExamsUsed: 2 }));

    expect(component.hasInsufficientBalance()).toBeFalse();
  });

  it('should trust hasSufficientBalanceForPaid from the backend when free quota is exhausted', () => {
    component.quota.set(makeQuota({ remainingFreeQuota: 0, hasSufficientBalanceForPaid: true }));

    expect(component.hasInsufficientBalance()).toBeFalse();
  });

  it('should fall back to the locally aggregated wallet balance when the backend reports insufficient balance', () => {
    component.quota.set(
      makeQuota({ remainingFreeQuota: 0, hasSufficientBalanceForPaid: false, aiExamPrice: 20 }),
    );

    // No wallet balance loaded (walletService.walletBalance() is null by
    // default in this test), so totalAvailableBalance() is 0 -- below the
    // 20-unit price, so generation should be blocked.
    expect(component.hasInsufficientBalance()).toBeTrue();
  });
});
