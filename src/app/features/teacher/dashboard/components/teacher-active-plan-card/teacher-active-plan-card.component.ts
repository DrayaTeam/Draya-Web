// src/app/features/teacher/dashboard/components/teacher-active-plan-card/teacher-active-plan-card.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'draya-teacher-active-plan-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './teacher-active-plan-card.component.html',
  styleUrl: './teacher-active-plan-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class TeacherActivePlanCardComponent {
  readonly activePackagesCount = input<number>(3);
  readonly statusText = input<string>('سارية حتى نهاية الترم');
}
