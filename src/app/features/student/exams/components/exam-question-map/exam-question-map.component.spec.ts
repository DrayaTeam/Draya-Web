// src/app/features/student/exams/components/exam-question-map/exam-question-map.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExamQuestionMapComponent } from './exam-question-map.component';
import { ExamQuestion } from '../../../../../core/models/student-exam-taking.model';

describe('ExamQuestionMapComponent', () => {
  let component: ExamQuestionMapComponent;
  let fixture: ComponentFixture<ExamQuestionMapComponent>;

  const mockQuestions: readonly ExamQuestion[] = [
    {
      id: 'q1',
      index: 1,
      text: 'سؤال 1',
      subjectTag: 'الجبر',
      selectedOptionId: undefined,
      correctOptionId: 'opt2',
      options: [],
    },
    {
      id: 'q2',
      index: 2,
      text: 'سؤال 2',
      subjectTag: 'الجبر',
      selectedOptionId: 'opt1',
      correctOptionId: 'opt1',
      options: [],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamQuestionMapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamQuestionMapComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('questions', mockQuestions);
    fixture.componentRef.setInput('currentIndex', 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 2 question number buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.q-num-btn').length).toBe(2);
  });

  it('should emit selectQuestionIndex on button click', () => {
    spyOn(component.selectQuestionIndex, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('.q-num-btn');
    buttons[1].click();
    expect(component.selectQuestionIndex.emit).toHaveBeenCalledWith(1);
  });
});
