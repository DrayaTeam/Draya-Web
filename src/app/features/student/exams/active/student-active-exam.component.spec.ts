import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { StudentActiveExamComponent } from './student-active-exam.component';
import { ToastService } from '../../../../core/services/toast.service';

describe('StudentActiveExamComponent', () => {
  let component: StudentActiveExamComponent;
  let fixture: ComponentFixture<StudentActiveExamComponent>;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render top exam title and timer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.exam-title')?.textContent).toContain('امتحان الجبر');
    expect(compiled.querySelector('.timer-countdown')).toBeTruthy();
  });

  it('should render question card and map sidebar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-exam-question-card')).toBeTruthy();
    expect(compiled.querySelector('app-exam-question-map')).toBeTruthy();
  });
});
