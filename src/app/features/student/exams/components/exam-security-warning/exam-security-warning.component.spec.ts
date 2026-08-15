// src/app/features/student/exams/components/exam-security-warning/exam-security-warning.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExamSecurityWarningComponent } from './exam-security-warning.component';

describe('ExamSecurityWarningComponent', () => {
  let component: ExamSecurityWarningComponent;
  let fixture: ComponentFixture<ExamSecurityWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamSecurityWarningComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamSecurityWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render warning text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.warning-title')?.textContent).toContain('مراقبة أمنية مشددة');
  });
});
