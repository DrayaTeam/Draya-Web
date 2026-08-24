// src/app/features/student/exams/components/exam-result-card/exam-result-card.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExamResultCardComponent } from './exam-result-card.component';
import { ExamResultReport } from '../../../../../core/models/student-exam-taking.model';

describe('ExamResultCardComponent', () => {
  let component: ExamResultCardComponent;
  let fixture: ComponentFixture<ExamResultCardComponent>;

  const mockReport: ExamResultReport = {
    examId: 'exam-1',
    examTitle: 'امتحان الجبر',
    scorePercentage: 66.6,
    gradeLabel: 'مقبول',
    isPassed: true,
    submittedAt: '20 يوليو 2026',
    weaknessTopics: [],
    reviewQuestions: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamResultCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamResultCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('report', mockReport);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render score percentage and grade label', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.score-percentage')?.textContent).toContain('66.6%');
    expect(compiled.querySelector('.grade-pill')?.textContent).toContain('مقبول');
  });

  it('should not render an AI weakness analysis card', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.ai-analysis-card')).toBeNull();
  });

  it('should show a pending state when grading is still in progress', () => {
    const pendingReport: ExamResultReport = {
      ...mockReport,
      isGradingPending: true,
    };

    fixture.componentRef.setInput('report', pendingReport);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.score-percentage')?.textContent).toContain('⏳');
  });
});
