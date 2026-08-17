// src/app/features/teacher/dashboard/components/teacher-quick-actions/teacher-quick-actions.component.ts
import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'draya-teacher-quick-actions',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './teacher-quick-actions.component.html',
  styleUrl: './teacher-quick-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherQuickActionsComponent {
  readonly createAiExamClick = output<void>();
  readonly newLectureClick = output<void>();
  readonly followupStudentsClick = output<void>();
  readonly openReportsClick = output<void>();
}
