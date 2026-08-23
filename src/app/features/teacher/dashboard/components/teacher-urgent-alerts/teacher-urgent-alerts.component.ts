// src/app/features/teacher/dashboard/components/teacher-urgent-alerts/teacher-urgent-alerts.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'draya-teacher-urgent-alerts',
  standalone: true,
  imports: [],
  templateUrl: './teacher-urgent-alerts.component.html',
  styleUrl: './teacher-urgent-alerts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class TeacherUrgentAlertsComponent {
  readonly alerts = [
    {
      id: 1,
      title: 'امتحان الجبر التراكمي',
      time: 'غداً 10:00 ص',
      tag: 'عاجل جداً',
      isDanger: true,
    },
    {
      id: 2,
      title: 'امتحان الفيزياء (الموجات)',
      time: 'الخميس القادم',
      tag: 'قريباً',
      isWarning: true,
    },
  ];
}
