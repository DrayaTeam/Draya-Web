// src/app/core/services/student-exams.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import {
  StudentExamsService,
  deriveExamStatus,
  formatExamScoreDisplay,
} from './student-exams.service';
import { StudentExamSummaryDto } from '../models/student-exam.model';

function makeExam(overrides: Partial<StudentExamSummaryDto> = {}): StudentExamSummaryDto {
  return {
    id: 'exam-1',
    allowedAttempts: 1,
    ...overrides,
  };
}

describe('StudentExamsService', () => {
  let service: StudentExamsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentExamsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow filtering exams', () => {
    service.selectedFilter.set('completed');
    expect(service.selectedFilter()).toBe('completed');
  });

  describe('deriveExamStatus', () => {
    const now = new Date('2026-06-15T12:00:00Z');

    it('is scheduled when startDate is in the future', () => {
      const status = deriveExamStatus(makeExam({ startDate: '2026-06-16T00:00:00Z' }), now);
      expect(status).toBe('scheduled');
    });

    it('is expired when endDate passed and nothing was submitted', () => {
      const status = deriveExamStatus(makeExam({ endDate: '2026-06-14T00:00:00Z' }), now);
      expect(status).toBe('expired');
    });

    it('is in-progress when attemptStatus is InProgress', () => {
      const status = deriveExamStatus(makeExam({ attemptStatus: 'InProgress' }), now);
      expect(status).toBe('in-progress');
    });

    it('is pending-grading when attemptStatus is PendingGrading', () => {
      const status = deriveExamStatus(makeExam({ attemptStatus: 'PendingGrading' }), now);
      expect(status).toBe('pending-grading');
    });

    it('is completed when hasSubmitted is true', () => {
      const status = deriveExamStatus(makeExam({ hasSubmitted: true }), now);
      expect(status).toBe('completed');
    });

    it('is completed once usedAttempts reaches allowedAttempts', () => {
      const status = deriveExamStatus(makeExam({ usedAttempts: 1, allowedAttempts: 1 }), now);
      expect(status).toBe('completed');
    });

    it('is available when no other condition applies', () => {
      const status = deriveExamStatus(makeExam({}), now);
      expect(status).toBe('available');
    });
  });

  it('maps attempts[] into latestAttemptId and needsTeacherReview on loadExams', () => {
    service.loadExams();
    const req = httpMock.expectOne((r) => r.url.includes('/students/exams'));
    req.flush({
      items: [
        makeExam({
          id: 'exam-42',
          hasSubmitted: true,
          latestScore: 90,
          attempts: [
            { id: 'att-1', finalScore: 60, needsTeacherReview: false },
            { id: 'att-2', finalScore: 90, needsTeacherReview: true },
          ],
        }),
      ],
    });

    const mapped = service.exams();
    expect(mapped.length).toBe(1);
    expect(mapped[0].latestAttemptId).toBe('att-2');
    expect(mapped[0].needsTeacherReview).toBeTrue();
    expect(mapped[0].status).toBe('completed');
  });

  it("prefers the latest attempt's own maxScore over the exam-level maxScore for score display", () => {
    // Backend confirmed GET /students/exams now includes maxScore per attempt
    // (not just at the exam level) — prefer the attempt's own value so score
    // and total always come from the same object.
    service.loadExams();
    const req = httpMock.expectOne((r) => r.url.includes('/students/exams'));
    req.flush({
      items: [
        makeExam({
          id: 'exam-7',
          hasSubmitted: true,
          latestScore: 8.5,
          maxScore: 20, // exam-level total differs from the attempt's own total
          attempts: [{ id: 'att-1', finalScore: 8.5, maxScore: 10, needsTeacherReview: false }],
        }),
      ],
    });

    const mapped = service.exams();
    expect(mapped[0].scorePercent).toBe(85);
  });

  describe('formatExamScoreDisplay', () => {
    it('formats score with total count into percentage correctly', () => {
      const result = formatExamScoreDisplay(3, 5);
      expect(result.percent).toBe(60);
      expect(result.text).toBe('الدرجة: 60%');
    });

    it('formats raw percentage directly if > 10', () => {
      const result = formatExamScoreDisplay(85);
      expect(result.percent).toBe(85);
      expect(result.text).toBe('الدرجة: 85%');
    });

    it('returns تم التسليم when score is null or undefined', () => {
      const result = formatExamScoreDisplay(null);
      expect(result.percent).toBeNull();
      expect(result.text).toBe('تم التسليم');
    });

    it('does not misinterpret a genuinely low percentage as points-out-of-10', () => {
      // Regression test: a bare score of 8 with no total used to be guessed as
      // "8 out of 10" -> 80%, which silently corrupts a real 8% score.
      const result = formatExamScoreDisplay(8);
      expect(result.percent).toBe(8);
    });

    it('falls back to treating the score as a percentage when it exceeds the given total', () => {
      // total and rawScore disagree on units (e.g. stale/mismatched maxScore) —
      // dividing would produce a nonsensical >100% figure before clamping.
      const result = formatExamScoreDisplay(85, 5);
      expect(result.percent).toBe(85);
    });

    it('clamps out-of-range values to [0, 100]', () => {
      expect(formatExamScoreDisplay(150).percent).toBe(100);
      expect(formatExamScoreDisplay(-10).percent).toBe(0);
    });
  });
});
