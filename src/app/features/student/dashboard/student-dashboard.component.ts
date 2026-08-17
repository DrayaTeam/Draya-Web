// src/app/features/student/dashboard/student-dashboard.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { StudentDashboardService } from '../../../core/services/student-dashboard.service';
import { CourseProgressCardComponent } from './components/course-progress-card/course-progress-card.component';
import { UpcomingExamCardComponent } from './components/upcoming-exam-card/upcoming-exam-card.component';
import { WeaknessTopicCardComponent } from './components/weakness-topic-card/weakness-topic-card.component';
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
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDashboardComponent {
  protected readonly auth = inject(AuthService);
  private readonly dashboardService = inject(StudentDashboardService);
  private readonly toastService = inject(ToastService);

  readonly summary = this.dashboardService.summary;
  readonly enrolledCourses = this.dashboardService.enrolledCourses;
  readonly upcomingExams = this.dashboardService.upcomingExams;
  readonly weaknessTopics = this.dashboardService.weaknessTopics;

  onResumeCourse(course: EnrolledCourseItem): void {
    this.toastService.info('استئناف الكورس', `جارٍ الانتقال لمتابعة درس ${course.title}...`);
  }
}
