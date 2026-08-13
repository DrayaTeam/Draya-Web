// src/app/features/teacher/dashboard/components/teacher-welcome-header/teacher-welcome-header.component.ts
import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'draya-teacher-welcome-header',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './teacher-welcome-header.component.html',
  styleUrl: './teacher-welcome-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherWelcomeHeaderComponent {
  readonly reviewAiClick = output<void>();
  readonly notificationsClick = output<void>();
}
