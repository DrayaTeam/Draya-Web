// src/app/features/teacher/dashboard/components/teacher-welcome-header/teacher-welcome-header.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  output,
  signal,
  inject,
  computed,
} from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { TeacherNotificationsService } from '../../../services/teacher-notifications.service';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../auth';

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
  private readonly auth = inject(AuthService);
  readonly isDropdownOpen = signal(false);

  /**
   * Real greeting from the logged-in teacher's own name and the actual
   * time of day -- this used to be the static i18n string "مساء الخير، أ.
   * محمد" shown to every teacher regardless of who signed in or when.
   */
  readonly greetingText = computed(() => {
    const hour = new Date().getHours();
    const prefix = hour < 12 ? 'صباح الخير' : 'مساء الخير';
    const firstName = this.auth.currentUser()?.fullName?.split(' ')[0];
    return firstName ? `${prefix}، أ. ${firstName}` : prefix;
  });

  readonly currentDateText = computed(() =>
    new Date().toLocaleDateString('ar-EG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  );

  toggleNotifications(): void {
    this.isDropdownOpen.update((v) => !v);
    if (this.isDropdownOpen()) {
      this.notificationsService.markAllAsRead();
    }
  }

  closeNotifications(): void {
    this.isDropdownOpen.set(false);
  }
}
