// src/app/features/teacher/exams/attempt-review/attempt-review.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter, convertToParamMap } from '@angular/router';
import { AttemptReviewComponent } from './attempt-review.component';

describe('AttemptReviewComponent', () => {
  let fixture: ComponentFixture<AttemptReviewComponent>;
  let component: AttemptReviewComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttemptReviewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ attemptId: 'att-1' }) },
          },
        },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AttemptReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushResults(body: Record<string, unknown>) {
    const req = httpMock.expectOne((r) => r.url.includes('/attempts/att-1/results'));
    req.flush(body);
  }

  it('should load attempt results on init', () => {
    flushResults({
      attemptId: 'att-1',
      examId: 'exam-1',
      examTitle: 'Midterm',
      finalScore: 70,
      maxScore: 100,
      needsTeacherReview: true,
      answers: [
        {
          answerId: 'ans-1',
          examQuestionId: 'q1',
          answerText: 'my answer',
          gradingResult: {
            score: 3,
            maxScore: 10,
            isAiGraded: true,
            needsTeacherReview: true,
            rationale: 'partially correct',
          },
          isFinalized: false,
        },
      ],
    });

    expect(component.result()?.examTitle).toBe('Midterm');
    expect(component.needsReviewCount()).toBe(1);
    expect(component.draftScores()['ans-1']).toBe(3);
  });

  it('should submit an override and refetch results', () => {
    flushResults({
      attemptId: 'att-1',
      examId: 'exam-1',
      finalScore: 30,
      answers: [
        {
          answerId: 'ans-1',
          examQuestionId: 'q1',
          gradingResult: { score: 0, maxScore: 10, isAiGraded: true, needsTeacherReview: true },
          isFinalized: false,
        },
      ],
    });

    component.onScoreInput('ans-1', '10');
    component.onSubmitOverride('ans-1', 10);

    const overrideReq = httpMock.expectOne((r) =>
      r.url.includes('/attempts/att-1/answers/ans-1/override'),
    );
    expect(overrideReq.request.method).toBe('PUT');
    expect(overrideReq.request.body).toEqual({ newScore: 10 });
    overrideReq.flush(null);

    // Refetch triggered after a successful override.
    flushResults({
      attemptId: 'att-1',
      examId: 'exam-1',
      finalScore: 100,
      answers: [
        {
          answerId: 'ans-1',
          examQuestionId: 'q1',
          gradingResult: { score: 10, maxScore: 10, isAiGraded: false, needsTeacherReview: false },
          isFinalized: true,
        },
      ],
    });

    expect(component.result()?.finalScore).toBe(100);
    expect(component.needsReviewCount()).toBe(0);
  });

  it('should clamp an out-of-range override score before submitting', () => {
    flushResults({
      attemptId: 'att-1',
      examId: 'exam-1',
      finalScore: 0,
      answers: [
        {
          answerId: 'ans-1',
          examQuestionId: 'q1',
          gradingResult: { score: 0, maxScore: 10, isAiGraded: true, needsTeacherReview: true },
          isFinalized: false,
        },
      ],
    });

    component.onScoreInput('ans-1', '999');
    component.onSubmitOverride('ans-1', 10);

    const overrideReq = httpMock.expectOne((r) =>
      r.url.includes('/attempts/att-1/answers/ans-1/override'),
    );
    expect(overrideReq.request.body).toEqual({ newScore: 10 });
    overrideReq.flush(null);

    flushResults({ attemptId: 'att-1', examId: 'exam-1', finalScore: 100, answers: [] });
  });
});
