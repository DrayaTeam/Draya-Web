// src/app/features/teacher/dashboard/components/teacher-ai-reports-banner/teacher-ai-reports-banner.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { TeacherAiAlertBanner } from '../../../models/teacher-dashboard.model';

@Component({
  selector: 'draya-teacher-ai-reports-banner',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './teacher-ai-reports-banner.component.html',
  styleUrl: './teacher-ai-reports-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherAiReportsBannerComponent {
  readonly aiAlert = input.required<TeacherAiAlertBanner>();
  readonly reviewClick = output<void>();
}
