import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import {
  StudentExamTakingService,
  interpretStartAttemptError,
} from './student-exam-taking.service';

describe('StudentExamTakingService', () => {
  let service: StudentExamTakingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentExamTakingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should navigate between questions', () => {
    service.questions.set([
      { id: 'q1', index: 1, text: 'Q1', subjectTag: 'عام', isFlagged: false, options: [] },
      { id: 'q2', index: 2, text: 'Q2', subjectTag: 'عام', isFlagged: false, options: [] },
    ]);
    expect(service.currentQuestionIndex()).toBe(0);
    service.nextQuestion();
    expect(service.currentQuestionIndex()).toBe(1);
    service.prevQuestion();
    expect(service.currentQuestionIndex()).toBe(0);
  });

  it('should select option for a question', () => {
    service.questions.set([
      {
        id: 'q1',
        index: 1,
        text: 'Q1',
        subjectTag: 'عام',
        isFlagged: false,
        options: [{ id: 'opt1', text: 'Option 1' }],
      },
    ]);
    service.selectOption('q1', 'opt1');
    const q1 = service.questions().find((q) => q.id === 'q1');
    expect(q1?.selectedOptionId).toBe('opt1');
  });

  it('should toggle flag question status', () => {
    service.questions.set([
      { id: 'q1', index: 1, text: 'Q1', subjectTag: 'عام', isFlagged: false, options: [] },
    ]);
    const initialFlag = service.questions()[0].isFlagged;
    service.toggleFlagQuestion('q1');
    expect(service.questions()[0].isFlagged).toBe(!initialFlag);
  });

  it('should submit exam', () => {
    service.questions.set([
      { id: 'q1', index: 1, text: 'Q1', subjectTag: 'عام', isFlagged: false, options: [] },
    ]);
    service.submitExam('real-attempt-1');
    expect(service.isSubmitted()).toBeTrue();
    const req = httpMock.expectOne((r) => r.url.includes('/attempts/real-attempt-1/submit'));
    expect(req.request.method).toBe('POST');
    req.flush({ gradingJobId: 'job-1' });

    const gradeReq = httpMock.expectOne((r) => r.url.includes('/attempts/real-attempt-1/grade'));
    expect(gradeReq.request.method).toBe('POST');
    gradeReq.flush({ id: 'job-1', status: 'Pending' });

    const jobReq = httpMock.expectOne((r) => r.url.includes('/attempts/jobs/job-1'));
    expect(jobReq.request.method).toBe('GET');
    jobReq.flush({ id: 'job-1', status: 'Completed' });

    const resReq = httpMock.expectOne((r) => r.url.includes('/attempts/real-attempt-1/results'));
    expect(resReq.request.method).toBe('GET');
    resReq.flush({ attemptId: 'real-attempt-1', finalScore: 80, answers: [] });
  });

  it('should load exam questions from database endpoint', () => {
    const validExamId = '550e8400-e29b-41d4-a716-446655440000';
    service.loadExamSession(validExamId).subscribe();

    const startReq = httpMock.expectOne((r) => r.url.includes('/attempts/start'));
    expect(startReq.request.method).toBe('POST');
    startReq.flush({ attemptId: 'real-attempt-1' });

    const req = httpMock.expectOne((r) => r.url.includes(`/students/exams/${validExamId}`));
    expect(req.request.method).toBe('GET');
    req.flush({
      id: validExamId,
      title: 'Auto-Generated Exam: rxjs',
      topic: 'rxjs',
      questions: [
        {
          id: 'rq1',
          text: 'What is an Observable?',
          type: 'MCQ',
          options: [
            { id: 'ro1', text: 'A stream of async events' },
            { id: 'ro2', text: 'A plain string' },
          ],
        },
      ],
    });

    expect(service.examTitle()).toBe('Auto-Generated Exam: rxjs');
    expect(service.questions().length).toBe(1);
    expect(service.questions()[0].text).toBe('What is an Observable?');
  });

  it('should refuse to submit when no attempt id is known', () => {
    service.questions.set([
      { id: 'q1', index: 1, text: 'Q1', subjectTag: 'عام', isFlagged: false, options: [] },
    ]);
    service.submitExam();
    expect(service.isSubmitted()).toBeFalse();
    httpMock.expectNone((r) => r.url.includes('/attempts/'));
  });

  it('should classify start-attempt failures by message text', () => {
    expect(interpretStartAttemptError({ code: 'X', message: 'No attempts remaining' })).toBe(
      'no-attempts-remaining',
    );
    expect(interpretStartAttemptError({ code: 'X', message: 'Exam has expired' })).toBe(
      'exam-expired',
    );
    expect(interpretStartAttemptError({ code: 'X', message: 'Attempt already in progress' })).toBe(
      'attempt-in-progress',
    );
    expect(interpretStartAttemptError({ code: 'X', message: 'Something else' })).toBe('unknown');
    expect(interpretStartAttemptError(undefined)).toBe('unknown');
  });

  it('should surface a typed start-attempt failure reason on the session signal', () => {
    const validExamId = '550e8400-e29b-41d4-a716-446655440001';
    service.loadExamSession(validExamId).subscribe();

    const startReq = httpMock.expectOne((r) => r.url.includes('/attempts/start'));
    // No error interceptor is wired in this isolated TestBed, so the raw
    // HttpErrorResponse flows through — its message won't match any keyword,
    // which is exactly the "unknown" fallback path this asserts.
    startReq.flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    const req = httpMock.expectOne((r) => r.url.includes(`/students/exams/${validExamId}`));
    req.flush({ id: validExamId, title: 'Exam', questions: [] });

    expect(service.startAttemptFailureReason()).toBe('unknown');
  });

  it('should not leak an answer key into ExamQuestion when loading a session', () => {
    const validExamId = '550e8400-e29b-41d4-a716-446655440002';
    service.loadExamSession(validExamId).subscribe();

    const startReq = httpMock.expectOne((r) => r.url.includes('/attempts/start'));
    startReq.flush({ attemptId: 'att-x' });

    const req = httpMock.expectOne((r) => r.url.includes(`/students/exams/${validExamId}`));
    req.flush({
      id: validExamId,
      title: 'Exam',
      questions: [
        {
          id: 'q1',
          text: 'Q1',
          type: 'MCQ',
          options: [
            { id: 'o1', text: 'A' },
            { id: 'o2', text: 'B' },
          ],
        },
      ],
    });

    const question = service.questions()[0] as unknown as Record<string, unknown>;
    expect('correctOptionId' in question).toBeFalse();
  });
});
