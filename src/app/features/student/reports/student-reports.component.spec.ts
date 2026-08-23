// src/app/features/student/reports/student-reports.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentReportsComponent } from './student-reports.component';
import { ToastService } from '../../../core/services/toast.service';
import { MessageService } from 'primeng/api';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { StudentReportsService } from '../../../core/services/student-reports.service';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../../core/models/user.model';

describe('StudentReportsComponent', () => {
  let component: StudentReportsComponent;
  let fixture: ComponentFixture<StudentReportsComponent>;
  let reportsService: StudentReportsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentReportsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService(),
        MessageService,
        ToastService,
        StudentReportsService,
      ],
    }).compileComponents();

    reportsService = TestBed.inject(StudentReportsService);
    spyOn(reportsService, 'loadReports').and.returnValue(of(true));
    reportsService.isLoading.set(false);

    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'currentUser').and.returnValue({ userId: 'std-123' } as User);

    fixture = TestBed.createComponent(StudentReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render main title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.main-title')?.textContent).toContain(
      'سجل درجاتي وتحليلات الأداء',
    );
  });

  it('should render summary KPI cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-report-kpi-card');
    expect(cards.length).toBe(3);
  });

  it('should open AI revision modal on topic review click', () => {
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

    expect(component.showRevisionModal()).toBeTrue();
    expect(component.currentTopicTitle()).toBe('المشتقات والتكامل');

    component.closeRevisionModal();
    expect(component.showRevisionModal()).toBeFalse();
  });
});
