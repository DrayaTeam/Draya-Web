import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { StudentExamTakingService } from './student-exam-taking.service';

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
    expect(service.currentQuestionIndex()).toBe(0);
    service.nextQuestion();
    expect(service.currentQuestionIndex()).toBe(1);
    service.prevQuestion();
    expect(service.currentQuestionIndex()).toBe(0);
  });

  it('should select option for a question', () => {
    service.selectOption('q1', 'opt1');
    const q1 = service.questions().find((q) => q.id === 'q1');
    expect(q1?.selectedOptionId).toBe('opt1');
  });

  it('should toggle flag question status', () => {
    const initialFlag = service.questions()[0].isFlagged;
    service.toggleFlagQuestion('q1');
    expect(service.questions()[0].isFlagged).toBe(!initialFlag);
  });

  it('should submit exam', () => {
    service.submitExam();
    expect(service.isSubmitted()).toBeTrue();
    const req = httpMock.expectOne((r) => r.url.includes('/attempts/') && r.url.includes('/submit'));
    expect(req.request.method).toBe('POST');
    req.flush({ gradingJobId: 'job-1' });
  });

  it('should load exam questions from database endpoint', () => {
    service.loadExamSession('real-exam-123').subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('/students/exams/real-exam-123'));
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 'real-exam-123',
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
});
