// src/app/features/teacher/dashboard/components/teacher-welcome-header/teacher-welcome-header.component.ts
import { Component, ChangeDetectionStrategy, output, signal, inject } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { TeacherNotificationsService } from '../../../services/teacher-notifications.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'draya-teacher-welcome-header',
  standalone: true,
  imports: [TranslatePipe, CommonModule, DatePipe],
  templateUrl: './teacher-welcome-header.component.html',
  styleUrl: './teacher-welcome-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherWelcomeHeaderComponent {
  readonly reviewAiClick = output<void>();
  readonly notificationsClick = output<void>();
  readonly notificationsService = inject(TeacherNotificationsService);
  readonly isDropdownOpen = signal(false);

  toggleNotifications(): void {
    this.isDropdownOpen.update(v => !v);
    if (this.isDropdownOpen()) {
      this.notificationsService.markAllAsRead();
    }
  }

  closeNotifications(): void {
    this.isDropdownOpen.set(false);
  }
}
