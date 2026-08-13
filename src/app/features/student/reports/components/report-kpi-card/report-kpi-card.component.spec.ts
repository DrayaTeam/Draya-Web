// src/app/features/student/reports/components/report-kpi-card/report-kpi-card.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportKpiCardComponent } from './report-kpi-card.component';

describe('ReportKpiCardComponent', () => {
  let component: ReportKpiCardComponent;
  let fixture: ComponentFixture<ReportKpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportKpiCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportKpiCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'المتوسط الكلي');
    fixture.componentRef.setInput('value', '87%');
    fixture.componentRef.setInput('variant', 'average');
    fixture.componentRef.setInput('badgeText', '+5%');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and value', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.kpi-title')?.textContent).toContain('المتوسط الكلي');
    expect(compiled.querySelector('.kpi-value')?.textContent).toContain('87%');
  });
});
