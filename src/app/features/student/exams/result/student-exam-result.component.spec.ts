import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { StudentExamResultComponent } from './student-exam-result.component';
import { ToastService } from '../../../../core/services/toast.service';
import { StudentExamTakingService } from '../../../../core/services/student-exam-taking.service';

describe('StudentExamResultComponent', () => {
  let component: StudentExamResultComponent;
  let fixture: ComponentFixture<StudentExamResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentExamResultComponent],
      providers: [
        MessageService,
        ToastService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentExamResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render main title and review section title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.main-title')?.textContent).toContain(
      'تقرير تحليل نتيجة الامتحان',
    );
    expect(compiled.querySelector('.section-title')?.textContent).toContain(
      'مراجعة الأسئلة والإجابات',
    );
  });

  it('should render review cards when questions exist', () => {
    const examService = TestBed.inject(StudentExamTakingService);
    examService.examResult.set({
      examId: 'test-1',
      examTitle: 'Test Exam',
      scorePercentage: 100,
      gradeLabel: 'ممتاز',
      isPassed: true,
      isGradingPending: false,
      submittedAt: 'اليوم',
      weaknessTopics: [],
      reviewQuestions: [
        {
          questionIndex: 1,
          questionText: 'Test Question',
          isCorrect: true,
          studentAnswerText: 'Ans A',
          correctAnswerText: 'Ans A',
        },
      ],
    });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-exam-question-review-card').length).toBeGreaterThan(0);
  });
});
