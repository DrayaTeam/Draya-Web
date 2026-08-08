// src/app/features/teacher/dashboard/components/teacher-improvement-points/teacher-improvement-points.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'draya-teacher-improvement-points',
  standalone: true,
  imports: [],
  templateUrl: './teacher-improvement-points.component.html',
  styleUrl: './teacher-improvement-points.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class TeacherImprovementPointsComponent {
  readonly points = [
    {
      id: 'p1',
      title: 'المشتقات والاتصال الرياضي',
      score: 42,
      color: '#FF2056',
    },
    {
      id: 'p2',
      title: 'الدوائر المغلقة وقوانين أوم',
      score: 55,
      color: '#FE9A00',
    },
  ];
}
