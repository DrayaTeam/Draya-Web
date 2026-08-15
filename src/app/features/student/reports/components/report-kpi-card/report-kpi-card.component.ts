// src/app/features/student/reports/components/report-kpi-card/report-kpi-card.component.ts

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ReportKpiVariant = 'average' | 'exams' | 'topScore';

@Component({
  selector: 'app-report-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-kpi-card.component.html',
  styleUrl: './report-kpi-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportKpiCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string>();
  readonly variant = input.required<ReportKpiVariant>();
  readonly badgeText = input<string>();
}
