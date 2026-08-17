// src/app/features/teacher/dashboard/components/teacher-submissions-chart/teacher-submissions-chart.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SubmissionsChartMeta } from '../../../models/teacher-dashboard.model';

@Component({
  selector: 'draya-teacher-submissions-chart',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './teacher-submissions-chart.component.html',
  styleUrl: './teacher-submissions-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherSubmissionsChartComponent {
  readonly chartMeta = input.required<SubmissionsChartMeta>();
  readonly timeRange = input.required<'week' | 'month' | 'quarter'>();
  readonly rangeChange = output<'week' | 'month' | 'quarter'>();
}
