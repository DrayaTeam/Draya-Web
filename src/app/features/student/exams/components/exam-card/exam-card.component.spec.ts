// src/app/features/student/exams/components/exam-card/exam-card.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExamCardComponent } from './exam-card.component';
import { StudentExamItem } from '../../../../../core/models/student-exam.model';

describe('ExamCardComponent', () => {
  let component: ExamCardComponent;
  let fixture: ComponentFixture<ExamCardComponent>;

  const mockAvailableExam: StudentExamItem = {
    id: 'ex-1',
    title: 'امتحان الجبر والتباديل والتوافيق',
    teacherName: 'أ. أحمد السيد',
    subjectName: 'الرياضيات',
    status: 'available',
    statusLabel: 'متاح للحل الآن 🔥',
    durationMinutes: 45,
    secondaryDetailText: 'جاهز للبدء',
    cornerTintBg: '#0EA5E9',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('exam', mockAvailableExam);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and status label', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.exam-card-title')?.textContent).toContain(
      'امتحان الجبر والتباديل والتوافيق',
    );
    expect(compiled.querySelector('.status-pill-badge')?.textContent).toContain('متاح للحل الآن');
  });

  it('should emit startExam when available exam button is clicked', () => {
    spyOn(component.startExam, 'emit');
    const btn = fixture.nativeElement.querySelector('.btn-exam-action');
    btn.click();
    expect(component.startExam.emit).toHaveBeenCalledWith(mockAvailableExam);
  });

  it('should emit startExam (resume) when an in-progress exam button is clicked', () => {
    const inProgressExam: StudentExamItem = { ...mockAvailableExam, status: 'in-progress' };
    fixture.componentRef.setInput('exam', inProgressExam);
    fixture.detectChanges();

    spyOn(component.startExam, 'emit');
    const btn = fixture.nativeElement.querySelector('.btn-exam-action');
    btn.click();
    expect(component.startExam.emit).toHaveBeenCalledWith(inProgressExam);
  });

  it('should emit viewResults when a pending-grading exam button is clicked', () => {
    const pendingExam: StudentExamItem = { ...mockAvailableExam, status: 'pending-grading' };
    fixture.componentRef.setInput('exam', pendingExam);
    fixture.detectChanges();

    spyOn(component.viewResults, 'emit');
    const btn = fixture.nativeElement.querySelector('.btn-exam-action');
    btn.click();
    expect(component.viewResults.emit).toHaveBeenCalledWith(pendingExam);
  });

  it('should disable the action button when expired', () => {
    const expiredExam: StudentExamItem = { ...mockAvailableExam, status: 'expired' };
    fixture.componentRef.setInput('exam', expiredExam);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('.btn-exam-action') as HTMLButtonElement;
    expect(btn.disabled).toBeTrue();
  });

  it('should show a retake button once attempts remain on a completed exam', () => {
    const completedExam: StudentExamItem = {
      ...mockAvailableExam,
      status: 'completed',
      allowedAttempts: 3,
      attemptsTaken: 1,
    };
    fixture.componentRef.setInput('exam', completedExam);
    fixture.detectChanges();

    spyOn(component.retakeExam, 'emit');
    const retakeBtn = fixture.nativeElement.querySelector('.btn-exam-retake') as HTMLButtonElement;
    expect(retakeBtn).toBeTruthy();
    retakeBtn.click();
    expect(component.retakeExam.emit).toHaveBeenCalledWith(completedExam);
  });

  it('should not show a retake button once attempts are exhausted', () => {
    const completedExam: StudentExamItem = {
      ...mockAvailableExam,
      status: 'completed',
      allowedAttempts: 1,
      attemptsTaken: 1,
    };
    fixture.componentRef.setInput('exam', completedExam);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.btn-exam-retake')).toBeFalsy();
  });
});
