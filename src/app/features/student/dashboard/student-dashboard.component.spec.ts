// src/app/features/student/dashboard/student-dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { StudentDashboardComponent } from './student-dashboard.component';
import { AuthService } from '../../auth/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

describe('StudentDashboardComponent', () => {
  let component: StudentDashboardComponent;
  let fixture: ComponentFixture<StudentDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDashboardComponent],
      providers: [
        provideTranslateService(),
        provideRouter([]),
        MessageService,
        ToastService,
        {
          provide: AuthService,
          useValue: {
            currentUser: () => ({ name: 'أحمد' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display student welcome title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-title')?.textContent).toContain('أحمد');
  });

  it('should render daily course progress cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('draya-course-progress-card');
    expect(cards.length).toBe(3);
  });

  it('should render upcoming exams and weakness topic widgets', () => {
    const examCards = fixture.nativeElement.querySelectorAll('draya-upcoming-exam-card');
    const topicCards = fixture.nativeElement.querySelectorAll('draya-weakness-topic-card');
    expect(examCards.length).toBe(2);
    expect(topicCards.length).toBe(2);
  });
});
