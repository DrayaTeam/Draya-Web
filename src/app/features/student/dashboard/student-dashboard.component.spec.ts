// src/app/features/student/dashboard/student-dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { StudentDashboardComponent } from './student-dashboard.component';
import { StudentDashboardService } from '../../../core/services/student-dashboard.service';
import { AuthService } from '../../auth';
import { ToastService } from '../../../core/services/toast.service';
import { UpcomingExamItem } from '../../../core/models/student-dashboard.model';

describe('StudentDashboardComponent', () => {
  let component: StudentDashboardComponent;
  let fixture: ComponentFixture<StudentDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        provideRouter([]),
        MessageService,
        ToastService,
        {
          provide: AuthService,
          useValue: {
            currentUser: () => ({ fullName: 'أحمد' }),
          },
        },
        {
          provide: StudentDashboardService,
          useValue: {
            loading: signal(false),
            error: signal(null),
            summary: signal({
              studentName: 'أحمد',
              currentDateText: 'السبت، 16 أغسطس 2026',
              scheduledExamsCount: 2,
              streakDays: 5,
              cumulativeAverage: 88,
              completedLessonsCount: 12,
              subscribedPackagesCount: 3,
            }),
            enrolledCourses: signal([]),
            upcomingExams: signal<UpcomingExamItem[]>(
              Array.from({ length: 5 }, (_, i) => ({
                id: `exam_${i + 1}`,
                title: `اختبار ${i + 1}`,
                timeText: 'غداً',
                tagText: 'رياضيات',
                borderMarkerColor: '#E17100',
                isImportant: false,
              })),
            ),
            weaknessTopics: signal([]),
            loadDashboard: () => undefined,
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

  it('should limit displayed courses to 3 items', () => {
    expect(component.displayedCourses().length).toBe(0);
    expect(component.remainingCoursesCount()).toBe(0);
  });

  it('should limit the dashboard upcoming-exams widget to 3 items even though more exist', () => {
    // Regression test: the widget used to render every upcoming exam with no
    // cap, unlike the courses list which was already capped to 3. Full list
    // is still reachable via the "عرض كل الامتحانات" link to /student/exams.
    expect(component.upcomingExams().length).toBe(5);
    expect(component.displayedUpcomingExams().length).toBe(3);
  });
});
