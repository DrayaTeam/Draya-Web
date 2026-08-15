// src/app/features/student/exams/result/student-exam-result.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentExamResultComponent } from './student-exam-result.component';
import { ToastService } from '../../../../core/services/toast.service';
import { MessageService } from 'primeng/api';
import { provideRouter } from '@angular/router';

describe('StudentExamResultComponent', () => {
  let component: StudentExamResultComponent;
  let fixture: ComponentFixture<StudentExamResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentExamResultComponent],
      providers: [MessageService, ToastService, provideRouter([])],
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

  it('should render review cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-exam-question-review-card').length).toBeGreaterThan(0);
  });
});
