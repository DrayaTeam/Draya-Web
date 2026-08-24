// src/app/core/services/student-dashboard.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StudentDashboardService } from './student-dashboard.service';

describe('StudentDashboardService', () => {
  let service: StudentDashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize summary signal', () => {
    const summary = service.summary();
    expect(summary).toBeTruthy();
  });

  function flushLoadDashboard(dash: Record<string, unknown> | null) {
    service.loadDashboard();

    const dashReq = httpMock.expectOne((r) => r.url.includes('/dashboard/student'));
    if (dash) {
      dashReq.flush(dash);
    } else {
      dashReq.flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });
    }

    httpMock.expectOne((r) => r.url.includes('/auth/me')).flush({ fullName: 'Test Student' });
    httpMock.expectOne((r) => r.url.includes('/classrooms')).flush({ items: [] });
    httpMock.expectOne((r) => r.url.includes('/students/exams')).flush({ items: [] });
    httpMock.expectOne((r) => r.url.includes('/students/materials')).flush({ totalCount: 0 });
  }

  it('should map overallAverage/currentStreak (the real wire fields), not the old fabricated names', () => {
    // Regression test: the frontend model previously invented
    // cumulativeAverage/streakDays/monthlyGrowthPercent/percentileRanking,
    // none of which exist on the real StudentDashboardDto (confirmed via
    // swagger). Every one of those reads silently fell back to its default.
    flushLoadDashboard({
      overallAverage: 87.4,
      currentStreak: 6,
      completedLessonsCount: 12,
      subscribedPackagesCount: 3,
    });

    const summary = service.summary();
    expect(summary.cumulativeAverage).toBe(87);
    expect(summary.streakDays).toBe(6);
  });

  it('should map pointsNeedingFocus (the real field) into weaknessTopics, trusting proficiencyPercent directly', () => {
    flushLoadDashboard({
      overallAverage: 60,
      currentStreak: 1,
      completedLessonsCount: 0,
      subscribedPackagesCount: 0,
      pointsNeedingFocus: [{ topicName: 'التفاضل', proficiencyPercent: 42 }],
    });

    const topics = service.weaknessTopics();
    expect(topics.length).toBe(1);
    expect(topics[0].topicTitle).toBe('التفاضل');
    expect(topics[0].scorePercent).toBe(42);
  });

  it('should map upcomingExams using the real examId field, not a nonexistent id field', () => {
    // Regression test: StudentDashboardDto.upcomingExams items use `examId`,
    // not `id` -- reading e.id previously produced upcoming-exam cards with
    // an undefined id (breaking navigation) whenever the backend actually
    // returned this array.
    flushLoadDashboard({
      overallAverage: 60,
      currentStreak: 1,
      completedLessonsCount: 0,
      subscribedPackagesCount: 0,
      upcomingExams: [
        { examId: 'exam-42', title: 'Algebra Quiz', startDate: '2026-09-01T00:00:00Z' },
      ],
    });

    const exams = service.upcomingExams();
    expect(exams.length).toBe(1);
    expect(exams[0].id).toBe('exam-42');
    expect(exams[0].title).toBe('Algebra Quiz');
  });

  it('should degrade to real defaults (not fabricate content) when the dashboard endpoint fails', () => {
    // The dash source catches its own error into null, so the overall
    // forkJoin still completes -- summary falls back to real zero defaults
    // rather than the pipeline surfacing a generic load error.
    flushLoadDashboard(null);

    expect(service.loading()).toBeFalse();
    expect(service.summary().cumulativeAverage).toBe(0);
    expect(service.summary().streakDays).toBe(0);
  });
});
