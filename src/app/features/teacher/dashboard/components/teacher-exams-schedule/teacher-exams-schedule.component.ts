// src/app/features/teacher/dashboard/components/teacher-exams-schedule/teacher-exams-schedule.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'draya-teacher-exams-schedule',
  standalone: true,
  imports: [],
  templateUrl: './teacher-exams-schedule.component.html',
  styleUrl: './teacher-exams-schedule.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
})
export class TeacherExamsScheduleComponent {
  readonly upcomingExams = [
    {
      id: 'e1',
      title: 'اختبار الباب الثالث (جبر)',
      time: 'غداً 10:00 ص',
      tag: 'هام',
      borderColor: '#FF2056',
    },
    {
      id: 'e2',
      title: 'مراجعة قانون كيرشوف (فيزياء)',
      time: 'الخميس 11:00 ص',
      tag: 'مراجعة',
      borderColor: '#FE9A00',
    },
  ];
}
