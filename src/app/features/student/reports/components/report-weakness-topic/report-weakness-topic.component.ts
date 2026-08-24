// src/app/features/student/reports/components/report-weakness-topic/report-weakness-topic.component.ts

import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportWeaknessTopic } from '../../../../../core/models/student-reports.model';

@Component({
  selector: 'app-report-weakness-topic',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-weakness-topic.component.html',
  styleUrl: './report-weakness-topic.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportWeaknessTopicComponent {
  readonly topic = input.required<ReportWeaknessTopic>();
  readonly isReviewed = input<boolean>(false);
  readonly startReview = output<ReportWeaknessTopic>();
}
