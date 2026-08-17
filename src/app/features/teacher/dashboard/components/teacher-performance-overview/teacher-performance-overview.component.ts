// src/app/features/teacher/dashboard/components/teacher-performance-overview/teacher-performance-overview.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'draya-teacher-performance-overview',
  standalone: true,
  imports: [],
  templateUrl: './teacher-performance-overview.component.html',
  styleUrl: './teacher-performance-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class TeacherPerformanceOverviewComponent {
  readonly averageScore = input<number>(87);
  readonly monthlyGrowth = input<string>('+4% هذا الشهر');
  readonly percentileText = input<string>('أعلى من 92% من الطلاب 👏');
}
