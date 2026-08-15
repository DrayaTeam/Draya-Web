// src/app/core/services/student-reports.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { StudentReportsService } from './student-reports.service';

describe('StudentReportsService', () => {
  let service: StudentReportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial summary state', () => {
    const summary = service.summary();
    expect(summary.overallAverage).toBe(87);
    expect(summary.monthlyGrowthPercent).toBe(5);
    expect(summary.completedExamsCount).toBe(12);
    expect(summary.topScorePercent).toBe(94);
  });

  it('should have subject scores', () => {
    const subjects = service.subjectScores();
    expect(subjects.length).toBe(3);
    expect(subjects[0].subjectName).toBe('الرياضيات');
  });

  it('should have weakness topics', () => {
    const topics = service.weaknessTopics();
    expect(topics.length).toBe(2);
  });
});
