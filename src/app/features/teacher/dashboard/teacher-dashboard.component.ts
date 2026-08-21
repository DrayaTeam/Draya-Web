// src/app/features/teacher/dashboard/teacher-dashboard.component.ts
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { TeacherDashboardService } from '../services/teacher-dashboard.service';
import { TeacherWelcomeHeaderComponent } from './components/teacher-welcome-header/teacher-welcome-header.component';
import { Router } from '@angular/router';
import { TeacherAiReportsBannerComponent } from './components/teacher-ai-reports-banner/teacher-ai-reports-banner.component';
import { TeacherKpiGridComponent } from './components/teacher-kpi-grid/teacher-kpi-grid.component';
import { TeacherSubmissionsChartComponent } from './components/teacher-submissions-chart/teacher-submissions-chart.component';
import { TeacherQuickActionsComponent } from './components/teacher-quick-actions/teacher-quick-actions.component';
import { TeacherAttentionAlertsComponent } from './components/teacher-attention-alerts/teacher-attention-alerts.component';
import { TeacherFollowupTableComponent } from './components/teacher-followup-table/teacher-followup-table.component';
import { TeacherRecentSubmissionsTableComponent } from './components/teacher-recent-submissions-table/teacher-recent-submissions-table.component';

@Component({
  selector: 'draya-teacher-dashboard',
  standalone: true,
  imports: [
    TeacherWelcomeHeaderComponent,
    TeacherAiReportsBannerComponent,
    TeacherKpiGridComponent,
    TeacherSubmissionsChartComponent,
    TeacherQuickActionsComponent,
    TeacherAttentionAlertsComponent,
    TeacherFollowupTableComponent,
    TeacherRecentSubmissionsTableComponent,
  ],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherDashboardComponent implements OnInit {
  protected readonly dashboardService = inject(TeacherDashboardService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly aiAlert = this.dashboardService.aiAlert;
  readonly kpiStats = this.dashboardService.kpiStats;
  readonly chartMeta = this.dashboardService.chartMeta;
  readonly timeRange = this.dashboardService.timeRange;
  readonly studentsNeedingFollowup = this.dashboardService.studentsNeedingFollowup;
  readonly recentSubmissions = this.dashboardService.recentSubmissions;

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe();
  }

  handleTimeRangeChange(range: 'week' | 'month' | 'quarter'): void {
    this.dashboardService.setTimeRange(range);
  }

  handleReviewAiReports(): void {
    this.toast.info(
      'مراجعة تقارير الذكاء الاصطناعي',
      'جارٍ فتح شاشة مراجعة واعتماد التقارير قبل إرسالها للأولياء.',
    );
  }

  handleCreateAiExam(): void {
    this.router.navigate(['/teacher/exams/generate']);
  }

  handleNewLecture(): void {
    this.router.navigate(['/teacher/classrooms']);
  }

  handleFollowupStudents(): void {
    this.router.navigate(['/teacher/students']);
  }

  handleOpenReports(): void {
    this.router.navigate(['/teacher/reports']);
  }

  handleNotificationClick(): void {
    this.toast.info('الإشعارات', 'لديك 2 إشعارات جديدة تنتظر الاطلاع.');
  }
}
