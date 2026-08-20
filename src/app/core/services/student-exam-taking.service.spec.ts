import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentExamTakingService } from './student-exam-taking.service';

describe('StudentExamTakingService', () => {
  let service: StudentExamTakingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentExamTakingService);
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
  });
});
