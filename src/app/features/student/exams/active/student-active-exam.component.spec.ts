import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { StudentActiveExamComponent } from './student-active-exam.component';
import { ToastService } from '../../../../core/services/toast.service';
import { StudentExamTakingService } from '../../../../core/services/student-exam-taking.service';

describe('StudentActiveExamComponent', () => {
  let component: StudentActiveExamComponent;
  let fixture: ComponentFixture<StudentActiveExamComponent>;
  let examService: StudentExamTakingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentActiveExamComponent],
      providers: [
        MessageService,
        ToastService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentActiveExamComponent);
    component = fixture.componentInstance;
    examService = TestBed.inject(StudentExamTakingService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render skeleton loader when loading', () => {
    examService.isLoading.set(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.exam-skeleton-layout')).toBeTruthy();
  });

  it('should render question card and map sidebar when questions are present', () => {
    examService.isLoading.set(false);
    examService.questions.set([
      {
        id: 'q1',
        index: 1,
        text: 'ما هو المتجه؟',
        subjectTag: 'رياضيات',
        options: [{ id: 'opt1', text: 'كمية متجهة' }],
        isFlagged: false,
      },
    ]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-exam-question-card')).toBeTruthy();
    expect(compiled.querySelector('app-exam-question-map')).toBeTruthy();
  });

  it('should render empty state when no questions are available', () => {
    examService.isLoading.set(false);
    examService.questions.set([]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.exam-empty-card')).toBeTruthy();
    expect(compiled.textContent).toContain('لا توجد أسئلة متاحة في هذا الامتحان حالياً');
  });
});
