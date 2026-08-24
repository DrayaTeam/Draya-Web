// src/app/features/teacher/services/teacher-dashboard.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { TeacherDashboardService } from './teacher-dashboard.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TeacherDashboardDto } from '../models/teacher-dashboard.model';
import { environment } from '../../../../environments/environment';

describe('TeacherDashboardService', () => {
  let service: TeacherDashboardService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TeacherDashboardService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TeacherDashboardService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide default kpi stats signal', () => {
    const stats = service.kpiStats();
    expect(stats.length).toBe(4);
    expect(stats[0].id).toBe('active_students');
  });

  it('should update time range signal', () => {
    expect(service.timeRange()).toBe('week');
    service.setTimeRange('month');
    expect(service.timeRange()).toBe('month');
  });

  it('should get dashboard data and update signals', () => {
    const mockData: TeacherDashboardDto = {
      examsAwaitingReview: 5,
      classAverage: 84.5,
      activeStudents: 20,
      reportsReadyForReview: 2,
      newMessagesCount: 1,
      weeklySubmissionsActivity: [],
      needsAttentionList: [],
      recentSubmissions: [],
    };

    service.getDashboardData().subscribe((result) => {
      expect(result).toBeTrue();

      const stats = service.kpiStats();
      const activeStudentsStat = stats.find((s) => s.id === 'active_students');
      expect(activeStudentsStat?.value).toBe('20');

      // Regression test: the class average KPI dropped its "%" suffix after
      // the first real data load (initial default was "0%", but the update
      // wrote a bare number).
      const avgStat = stats.find((s) => s.id === 'class_avg');
      expect(avgStat?.value).toBe('84.5%');

      expect(service.aiAlert()).toBeTruthy();
      expect(service.aiAlert()?.reportsCount).toBe(2);
    });

    const req = httpTestingController.expectOne(`${environment.apiBaseUrl}/dashboard/teacher`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should treat averageScore/overallAverage/score as already 0-100, not a 0-5 scale', () => {
    // Regression test: chartMeta divided averageScore by 5 before converting
    // to a percentage, needsAttentionList used a <2.5 "high risk" threshold,
    // and recentSubmissions used a >=4 "excellent" threshold -- all assuming
    // a 0-5 scale that doesn't exist on these confirmed 0-100 fields. A
    // genuine 84% average submission score used to render as ~17%.
    const mockData: TeacherDashboardDto = {
      examsAwaitingReview: 0,
      classAverage: 80,
      activeStudents: 10,
      reportsReadyForReview: 0,
      newMessagesCount: 0,
      weeklySubmissionsActivity: [
        { dayOfWeek: 'Sunday', submissionsCount: 3, averageScore: 84 },
        { dayOfWeek: 'Monday', submissionsCount: 2, averageScore: 76 },
      ],
      needsAttentionList: [{ studentId: 's1', studentName: 'Ahmed Ali', overallAverage: 40 }],
      recentSubmissions: [
        {
          examAttemptId: 'a1',
          studentId: 's1',
          studentName: 'Ahmed Ali',
          examTitle: 'Midterm',
          submittedAt: '2026-08-01T00:00:00Z',
          score: 90,
        },
      ],
    };

    service.getDashboardData().subscribe(() => {
      expect(service.chartMeta().averagePerformance).toBe(80);

      const followup = service.studentsNeedingFollowup();
      expect(followup[0].averageScore).toBe(40);
      expect(followup[0].riskLevel).toBe('high');

      const recent = service.recentSubmissions();
      expect(recent[0].score).toBe(90);
      expect(recent[0].gradeType).toBe('excellent');
    });

    const req = httpTestingController.expectOne(`${environment.apiBaseUrl}/dashboard/teacher`);
    req.flush(mockData);
  });
});
