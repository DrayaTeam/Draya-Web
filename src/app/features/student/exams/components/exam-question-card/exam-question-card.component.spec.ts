// src/app/features/student/exams/components/exam-question-card/exam-question-card.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExamQuestionCardComponent } from './exam-question-card.component';
import { ExamQuestion } from '../../../../../core/models/student-exam-taking.model';

describe('ExamQuestionCardComponent', () => {
  let component: ExamQuestionCardComponent;
  let fixture: ComponentFixture<ExamQuestionCardComponent>;

  const mockQuestion: ExamQuestion = {
    id: 'q1',
    index: 1,
    text: 'إذا كان ن ل ر = 120 ، فما هي قيم ن ، ر الممكنة؟',
    subjectTag: 'الجبر',
    selectedOptionId: undefined,
    isFlagged: false,
    options: [
      { id: 'opt1', text: 'ن = 5 ، ر = 3' },
      { id: 'opt2', text: 'ن = 6 ، ر = 3' },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamQuestionCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamQuestionCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('question', mockQuestion);
    fixture.componentRef.setInput('totalQuestionsCount', 3);
    fixture.componentRef.setInput('isFirstQuestion', true);
    fixture.componentRef.setInput('isLastQuestion', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render question text and options', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.question-text')?.textContent).toContain('إذا كان ن ل ر');
    expect(compiled.querySelectorAll('.option-item').length).toBe(2);
  });

  it('should emit selectOption on option click', () => {
    spyOn(component.selectOption, 'emit');
    const optionBtn = fixture.nativeElement.querySelector('.option-item') as HTMLButtonElement;
    optionBtn.click();
    expect(component.selectOption.emit).toHaveBeenCalledWith({
      questionId: 'q1',
      optionId: 'opt1',
    });
  });

  it('should emit toggleFlag on flag button click', () => {
    spyOn(component.toggleFlag, 'emit');
    const flagBtn = fixture.nativeElement.querySelector('.flag-btn') as HTMLButtonElement;
    flagBtn.click();
    expect(component.toggleFlag.emit).toHaveBeenCalledWith('q1');
  });
});
