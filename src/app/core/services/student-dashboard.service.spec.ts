// src/app/core/services/student-dashboard.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { StudentDashboardService } from './student-dashboard.service';

describe('StudentDashboardService', () => {
  let service: StudentDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize summary signal with student details', () => {
    const summary = service.summary();
    expect(summary.studentName).toBe('أحمد');
    expect(summary.cumulativeAverage).toBe(87);
  });

  it('should initialize 3 enrolled courses', () => {
    const courses = service.enrolledCourses();
    expect(courses.length).toBe(3);
    expect(courses[0].title).toBe('الجبر وحساب المثلثات');
  });

  it('should initialize upcoming exams and weakness topics', () => {
    expect(service.upcomingExams().length).toBe(2);
    expect(service.weaknessTopics().length).toBe(2);
  });
});
