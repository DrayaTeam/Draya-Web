// src/app/features/teacher/dashboard/components/teacher-urgent-alerts/teacher-urgent-alerts.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TeacherUrgentAlert } from '../../../models/teacher-dashboard.model';

@Component({
  selector: 'draya-teacher-urgent-alerts',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './teacher-urgent-alerts.component.html',
  styleUrl: './teacher-urgent-alerts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class TeacherUrgentAlertsComponent {
  readonly alerts = input<TeacherUrgentAlert[]>([]);
}

