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
      classAverage: 4.5,
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

      const avgStat = stats.find((s) => s.id === 'class_avg');
      expect(avgStat?.value).toBe('4.5');

      expect(service.aiAlert()).toBeTruthy();
      expect(service.aiAlert()?.reportsCount).toBe(2);
    });

    const req = httpTestingController.expectOne(`${environment.apiBaseUrl}/dashboard/teacher`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
