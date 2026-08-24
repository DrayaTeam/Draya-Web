// src/app/features/teacher/reports/teacher-reports.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { TeacherReportsComponent } from './teacher-reports.component';
import { ClassroomService } from '../services/classroom.service';
import { TeacherReportsService } from '../services/teacher-reports.service';
import { SignalRService } from '../../../core/signalr/signalr.service';
import {
  ReportGeneratedEvent,
  StudentAtRiskEvent,
} from '../../../core/models/signalr-events.model';

describe('TeacherReportsComponent', () => {
  let fixture: ComponentFixture<TeacherReportsComponent>;
  let component: TeacherReportsComponent;
  let messageService: MessageService;

  // SignalRService's real signals are readonly and only ever populated by a
  // live hub connection, so tests drive them through a stub exposing plain
  // writable signals cast to the same readonly shape the component reads.
  let reportGeneratedSignal: ReturnType<typeof signal<ReportGeneratedEvent | null>>;
  let studentAtRiskSignal: ReturnType<typeof signal<StudentAtRiskEvent | null>>;

  beforeEach(async () => {
    reportGeneratedSignal = signal<ReportGeneratedEvent | null>(null);
    studentAtRiskSignal = signal<StudentAtRiskEvent | null>(null);

    const classroomServiceStub = {
      getTeacherClassrooms: jasmine
        .createSpy('getTeacherClassrooms')
        .and.returnValue(of({ items: [], totalCount: 0 })),
      getClassroomStudents: jasmine
        .createSpy('getClassroomStudents')
        .and.returnValue(of({ items: [], totalCount: 0 })),
    };

    const reportsServiceStub = {
      getStudentAnalytics: jasmine.createSpy('getStudentAnalytics').and.returnValue(of(null)),
      getLatestPerformanceReport: jasmine
        .createSpy('getLatestPerformanceReport')
        .and.returnValue(of(null)),
      approveReport: jasmine.createSpy('approveReport').and.returnValue(of(null)),
    };

    const signalRServiceStub = {
      reportGenerated: reportGeneratedSignal.asReadonly(),
      studentAtRisk: studentAtRiskSignal.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [TeacherReportsComponent],
      providers: [
        provideTranslateService(),
        MessageService,
        { provide: ClassroomService, useValue: classroomServiceStub },
        { provide: TeacherReportsService, useValue: reportsServiceStub },
        { provide: SignalRService, useValue: signalRServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherReportsComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService);
    TestBed.inject(TranslateService).use('ar');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toast and refresh when reportGenerated fires for the currently selected student', () => {
    const addSpy = spyOn(messageService, 'add');
    component.selectedStudent.set({
      studentId: 'std-1',
      fullName: 'Ahmed',
      enrolledAt: '',
      status: 'Active',
    });

    const reportsService = TestBed.inject(TeacherReportsService) as unknown as {
      getStudentAnalytics: jasmine.Spy;
    };
    reportsService.getStudentAnalytics.calls.reset();

    reportGeneratedSignal.set({ reportId: 'rep-1', studentId: 'std-1' });
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
    expect(reportsService.getStudentAnalytics).toHaveBeenCalledWith('std-1');
  });

  it('should not refresh when reportGenerated fires for a different student', () => {
    component.selectedStudent.set({
      studentId: 'std-1',
      fullName: 'Ahmed',
      enrolledAt: '',
      status: 'Active',
    });

    const reportsService = TestBed.inject(TeacherReportsService) as unknown as {
      getStudentAnalytics: jasmine.Spy;
    };
    reportsService.getStudentAnalytics.calls.reset();

    reportGeneratedSignal.set({ reportId: 'rep-2', studentId: 'std-999' });
    fixture.detectChanges();

    expect(reportsService.getStudentAnalytics).not.toHaveBeenCalled();
  });

  it('should toast a warning built from the topic name when studentAtRisk fires', () => {
    const addSpy = spyOn(messageService, 'add');
    const instantSpy = spyOn(TestBed.inject(TranslateService), 'instant').and.callThrough();

    studentAtRiskSignal.set({ studentId: 'std-1', topicName: 'التفاضل' });
    fixture.detectChanges();

    expect(instantSpy).toHaveBeenCalledWith('TEACHER.REPORTS.TOAST_STUDENT_AT_RISK', {
      topicName: 'التفاضل',
    });
    expect(addSpy).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'warn' }));
  });
});
