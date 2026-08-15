// src/app/features/student/dashboard/components/course-progress-card/course-progress-card.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { EnrolledCourseItem } from '../../../../../core/models/student-dashboard.model';

@Component({
  selector: 'draya-course-progress-card',
  standalone: true,
  imports: [],
  templateUrl: './course-progress-card.component.html',
  styleUrl: './course-progress-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseProgressCardComponent {
  readonly course = input.required<EnrolledCourseItem>();
  readonly resumeWatching = output<EnrolledCourseItem>();

  onResume(): void {
    this.resumeWatching.emit(this.course());
  }
}
