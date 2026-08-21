import { Component, ChangeDetectionStrategy, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth';
import { StudentDashboardService } from '../../../core/services/student-dashboard.service';
import { CourseProgressCardComponent } from './components/course-progress-card/course-progress-card.component';
import { UpcomingExamCardComponent } from './components/upcoming-exam-card/upcoming-exam-card.component';
import { WeaknessTopicCardComponent } from './components/weakness-topic-card/weakness-topic-card.component';
import { DrayaEmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { EnrolledCourseItem } from '../../../core/models/student-dashboard.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'draya-student-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    CourseProgressCardComponent,
    UpcomingExamCardComponent,
    WeaknessTopicCardComponent,
    DrayaEmptyStateComponent,
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDashboardComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly dashboardService = inject(StudentDashboardService);
  private readonly toastService = inject(ToastService);

  // Data signals — bound directly to template
  readonly summary = this.dashboardService.summary;
  readonly enrolledCourses = this.dashboardService.enrolledCourses;
  readonly upcomingExams = this.dashboardService.upcomingExams;
  readonly weaknessTopics = this.dashboardService.weaknessTopics;

  // Display only first 3 classrooms on dashboard
  readonly displayedCourses = computed(() => this.enrolledCourses().slice(0, 3));
  readonly remainingCoursesCount = computed(() => Math.max(0, this.enrolledCourses().length - 3));

  // Loading / error signals — used for skeleton + error banner in template
  readonly loading = this.dashboardService.loading;
  readonly error = this.dashboardService.error;

  ngOnInit(): void {
    this.dashboardService.loadDashboard();
  }

  onResumeCourse(course: EnrolledCourseItem): void {
    this.toastService.info('استئناف الكورس', `جارٍ الانتقال لمتابعة درس ${course.title}...`);
  }
}
