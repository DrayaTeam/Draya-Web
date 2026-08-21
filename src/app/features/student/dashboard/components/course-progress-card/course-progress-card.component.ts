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

  readonly defaultThumbnail = 'assets/images/default-classroom.svg';

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('default-classroom.svg')) {
      target.src = this.defaultThumbnail;
    }
  }

  onResume(): void {
    this.resumeWatching.emit(this.course());
  }
}
