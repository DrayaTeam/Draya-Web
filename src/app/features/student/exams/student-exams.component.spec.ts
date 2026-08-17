// src/app/features/student/exams/student-exams.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { StudentExamsComponent } from './student-exams.component';
import { ToastService } from '../../../core/services/toast.service';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('StudentExamsComponent', () => {
  let component: StudentExamsComponent;
  let fixture: ComponentFixture<StudentExamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentExamsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        ToastService,
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentExamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render page heading and filter pills', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-heading')?.textContent).toContain(
      'الامتحانات والواجبات المجدولة',
    );
    expect(compiled.querySelectorAll('.filter-pill-btn').length).toBe(4);
  });

  it('should render 3 exam cards by default', () => {
    const cards = fixture.nativeElement.querySelectorAll('draya-exam-card');
    expect(cards.length).toBe(3);
  });

  it('should filter cards when filter pill is clicked', () => {
    component.setFilter('completed');
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('draya-exam-card');
    expect(cards.length).toBe(1);
  });
});
