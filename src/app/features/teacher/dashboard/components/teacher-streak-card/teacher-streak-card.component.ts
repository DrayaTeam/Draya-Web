// src/app/features/teacher/dashboard/components/teacher-streak-card/teacher-streak-card.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'draya-teacher-streak-card',
  standalone: true,
  imports: [],
  templateUrl: './teacher-streak-card.component.html',
  styleUrl: './teacher-streak-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class TeacherStreakCardComponent {
  readonly streakDays = input<number>(5);
  readonly averageGpa = input<number>(87);
  readonly completedLectures = input<number>(37);
}
