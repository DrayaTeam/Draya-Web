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
});
