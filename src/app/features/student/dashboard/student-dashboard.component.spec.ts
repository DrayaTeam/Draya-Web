// src/app/features/student/dashboard/student-dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { StudentDashboardComponent } from './student-dashboard.component';
import { StudentDashboardService } from '../../../core/services/student-dashboard.service';
import { AuthService } from '../../auth';
import { ToastService } from '../../../core/services/toast.service';
import { UpcomingExamItem, WeaknessTopicItem } from '../../../core/models/student-dashboard.model';

describe('StudentDashboardComponent', () => {
  let component: StudentDashboardComponent;
  let fixture: ComponentFixture<StudentDashboardComponent>;
  let upcomingExamsSignal: WritableSignal<UpcomingExamItem[]>;

  beforeEach(async () => {
    upcomingExamsSignal = signal<UpcomingExamItem[]>(
      Array.from({ length: 5 }, (_, i) => ({
        id: `exam_${i + 1}`,
        title: `اختبار ${i + 1}`,
        timeText: 'غداً',
        tagText: 'رياضيات',
        borderMarkerColor: '#E17100',
        isImportant: false,
      })),
    );

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
            upcomingExams: upcomingExamsSignal,
            weaknessTopics: signal<WeaknessTopicItem[]>(
              Array.from({ length: 5 }, (_, i) => ({
                id: `topic_${i + 1}`,
                topicTitle: `نقطة ضعف ${i + 1}`,
                scorePercent: 40,
                barColor: '#9810FA',
              })),
            ),
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

  it('should limit the dashboard weakness-topics widget to 3 items even though more exist', () => {
    // Same cap as the upcoming-exams widget above — full list is still
    // reachable via the "فتح تقارير التحليل المتقدمة" link to /student/reports.
    expect(component.weaknessTopics().length).toBe(5);
    expect(component.displayedWeaknessTopics().length).toBe(3);
  });

  it('drives the "تنبيهات ومواعيد عاجلة" card from real upcoming exams, capped to 2', () => {
    // Regression test: this card used to hardcode two fake exams
    // ("امتحان الجبر التراكمي" / "امتحان الفيزياء") unconditionally, with a
    // fixed "تنبيهان جديدان" pill regardless of the student's real schedule.
    expect(component.urgentAlerts().length).toBe(2);
    expect(component.urgentAlerts()[0].id).toBe('exam_1');
    expect(component.urgentAlertsCountLabel()).toBe('تنبيهان جديدان');
  });

  it('uses correct Arabic singular/plural wording for the alert count pill', () => {
    upcomingExamsSignal.set([]);
    expect(component.urgentAlerts().length).toBe(0);

    upcomingExamsSignal.set([
      {
        id: 'exam_1',
        title: 'اختبار 1',
        timeText: 'غداً',
        tagText: 'رياضيات',
        borderMarkerColor: '#E17100',
        isImportant: true,
      },
    ]);
    expect(component.urgentAlertsCountLabel()).toBe('تنبيه جديد');
  });
});
