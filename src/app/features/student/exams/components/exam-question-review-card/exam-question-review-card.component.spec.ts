// src/app/features/student/exams/components/exam-question-review-card/exam-question-review-card.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExamQuestionReviewCardComponent } from './exam-question-review-card.component';
import { ExamReviewItem } from '../../../../../core/models/student-exam-taking.model';

describe('ExamQuestionReviewCardComponent', () => {
  let component: ExamQuestionReviewCardComponent;
  let fixture: ComponentFixture<ExamQuestionReviewCardComponent>;

  const mockItem: ExamReviewItem = {
    questionIndex: 1,
    questionText: 'إذا كان ن ل ر = 120 ، فما هي قيم ن ، ر الممكنة؟',
    isCorrect: false,
    studentAnswerText: 'ن = 5 ، ر = 3',
    correctAnswerText: 'ن = 6 ، ر = 3',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamQuestionReviewCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamQuestionReviewCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('reviewItem', mockItem);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render question text and wrong status pill', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.question-body')?.textContent).toContain('إذا كان ن ل ر');
    expect(compiled.querySelector('.status-pill')?.textContent).toContain('إجابة خاطئة');
  });

  it('should render correct answer box when isCorrect is false', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.answer-box').length).toBe(2);
  });
});
