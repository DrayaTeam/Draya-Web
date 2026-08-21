import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentReportsService } from '../../../core/services/student-reports.service';
import { ToastService } from '../../../core/services/toast.service';
import { ReportKpiCardComponent } from './components/report-kpi-card/report-kpi-card.component';
import { ReportWeaknessTopicComponent } from './components/report-weakness-topic/report-weakness-topic.component';
import { ReportWeaknessTopic } from '../../../core/models/student-reports.model';

@Component({
  selector: 'app-student-reports',
  standalone: true,
  imports: [CommonModule, ReportKpiCardComponent, ReportWeaknessTopicComponent],
  templateUrl: './student-reports.component.html',
  styleUrl: './student-reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentReportsComponent implements OnInit {
  protected readonly reportsService = inject(StudentReportsService);
  private readonly toastService = inject(ToastService);

  readonly summary = this.reportsService.summary;
  readonly subjectScores = this.reportsService.subjectScores;
  readonly weaknessTopics = this.reportsService.weaknessTopics;
  readonly skillPoints = this.reportsService.skillRadarPoints;
  readonly isLoading = this.reportsService.isLoading;

  ngOnInit(): void {
    this.reportsService.loadReports().subscribe({
      next: () => void 0,
      error: () => void 0,
    });
  }

  onStartReview(topic: ReportWeaknessTopic): void {
    this.toastService.info(
      'بدء المراجعة التفاعلية',
      `جاري فتح المراجعة التفاعلية لموضوع: ${topic.topicTitle}`,
    );
  }
}
