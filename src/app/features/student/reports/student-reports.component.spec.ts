// src/app/features/student/reports/student-reports.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentReportsComponent } from './student-reports.component';
import { ToastService } from '../../../core/services/toast.service';
import { MessageService } from 'primeng/api';

describe('StudentReportsComponent', () => {
  let component: StudentReportsComponent;
  let fixture: ComponentFixture<StudentReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentReportsComponent],
      providers: [MessageService, ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render main title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.main-title')?.textContent).toContain('سجل درجاتي وتحليلات الأداء');
  });

  it('should render summary KPI cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-report-kpi-card');
    expect(cards.length).toBe(3);
  });

  it('should trigger toast on topic review click', () => {
    const toastService = TestBed.inject(ToastService);
    spyOn(toastService, 'info');

    component.onStartReview({
      id: 'test',
      topicTitle: 'المشتقات والتكامل',
      subjectName: 'الرياضيات',
      badgeText: 'تحسين',
      scorePercent: 40,
      barMarkerColor: '#FF0000',
      badgeBgColor: '#FFF',
      badgeTextColor: '#000',
      scoreTextColor: '#FF0000',
    });

    expect(toastService.info).toHaveBeenCalledWith(
      'بدء المراجعة التفاعلية',
      'جاري فتح المراجعة التفاعلية لموضوع: المشتقات والتكامل'
    );
  });
});
