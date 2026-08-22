import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TeacherDashboardService } from './teacher-dashboard.service';

describe('TeacherDashboardService', () => {
  let service: TeacherDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TeacherDashboardService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TeacherDashboardService);
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
});
