// src/app/features/teacher/dashboard/components/teacher-hero-banner/teacher-hero-banner.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'draya-teacher-hero-banner',
  standalone: true,
  imports: [],
  templateUrl: './teacher-hero-banner.component.html',
  styleUrl: './teacher-hero-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class TeacherHeroBannerComponent {
  readonly teacherName = input<string>('أحمد');
  readonly scheduledExamsCount = input<number>(2);

  readonly resumeClick = output<void>();
  readonly browseClick = output<void>();
}
