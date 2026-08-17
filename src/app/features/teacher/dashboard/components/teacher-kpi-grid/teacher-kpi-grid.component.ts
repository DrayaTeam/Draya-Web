// src/app/features/teacher/dashboard/components/teacher-kpi-grid/teacher-kpi-grid.component.ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TeacherKpiStat } from '../../../models/teacher-dashboard.model';

@Component({
  selector: 'draya-teacher-kpi-grid',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './teacher-kpi-grid.component.html',
  styleUrl: './teacher-kpi-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherKpiGridComponent {
  readonly stats = input.required<TeacherKpiStat[]>();
}
