// src/app/features/teacher/dashboard/teacher-dashboard.component.ts
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { ToastService } from '../../../core/services/toast.service';

import { TeacherHeroBannerComponent } from './components/teacher-hero-banner/teacher-hero-banner.component';
import { TeacherStreakCardComponent } from './components/teacher-streak-card/teacher-streak-card.component';
import { TeacherUrgentAlertsComponent } from './components/teacher-urgent-alerts/teacher-urgent-alerts.component';
import { TeacherActivePlanCardComponent } from './components/teacher-active-plan-card/teacher-active-plan-card.component';
import { TeacherPerformanceOverviewComponent } from './components/teacher-performance-overview/teacher-performance-overview.component';
import { TeacherDailyCoursesComponent } from './components/teacher-daily-courses/teacher-daily-courses.component';
import { TeacherExamsScheduleComponent } from './components/teacher-exams-schedule/teacher-exams-schedule.component';
import { TeacherImprovementPointsComponent } from './components/teacher-improvement-points/teacher-improvement-points.component';
import { SubscriptionWidgetComponent } from './subscription-widget/subscription-widget.component';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    TeacherHeroBannerComponent,
    TeacherStreakCardComponent,
    TeacherUrgentAlertsComponent,
    TeacherActivePlanCardComponent,
    TeacherPerformanceOverviewComponent,
    TeacherDailyCoursesComponent,
    TeacherExamsScheduleComponent,
    TeacherImprovementPointsComponent,
    SubscriptionWidgetComponent,
  ],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class TeacherDashboardComponent implements OnInit {
  protected readonly subscriptionService = inject(SubscriptionService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly plan = this.subscriptionService.plan;
  readonly quotas = this.subscriptionService.quotas;
  readonly loading = this.subscriptionService.loading;

  ngOnInit(): void {
    this.subscriptionService.loadSubscriptionData().subscribe();
  }

  handleResumeWatch(): void {
    this.toast.info('استئناف المشاهدة', 'جارٍ فتح شاشة التشغيل والمحاضرة التفاعلية...');
  }

  handleBrowseCourses(): void {
    this.toast.info('تصفح الكورسات', 'جاري التوجيه إلى استعراض المواد الكيميائية والفيزيائية...');
  }

  handleManageBilling(): void {
    this.toast.info('إدارة الاشتراك', 'سيتم تحويلك إلى صفحة تفاصيل الخطة وبوابة الدفع.');
    this.router.navigate(['/teacher/subscription']);
  }

  handleCancelSub(): void {
    this.toast.warning(
      'إلغاء التجديد التلقائي',
      'تم تسجيل طلبك. سيظل اشتراكك نشطاً حتى نهاية الفترة الحالية.',
    );
  }

  handleSimulateQuotaExceeded(): void {
    this.subscriptionService.handleQuotaExceeded();
  }
}
