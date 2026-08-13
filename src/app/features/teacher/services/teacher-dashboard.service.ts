// src/app/features/teacher/services/teacher-dashboard.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import type {
  TeacherKpiStat,
  TeacherAiAlertBanner,
  StudentNeedFollowup,
  RecentSubmission,
  SubmissionsChartMeta,
  SubmissionChartPoint,
} from '../models/teacher-dashboard.model';

@Injectable({ providedIn: 'root' })
export class TeacherDashboardService {
  // ── Signals State ──────────────────────────────────────────────────────────
  private readonly _aiAlert = signal<TeacherAiAlertBanner>({
    titleKey: 'TEACHER.DASHBOARD.AI_BANNER.TITLE',
    subtitleKey: 'TEACHER.DASHBOARD.AI_BANNER.SUBTITLE',
    reportsCount: 3,
    ctaKey: 'TEACHER.DASHBOARD.AI_BANNER.CTA',
  });
  readonly aiAlert = this._aiAlert.asReadonly();

  private readonly _kpiStats = signal<TeacherKpiStat[]>([
    {
      id: 'active_students',
      labelKey: 'TEACHER.DASHBOARD.KPI.ACTIVE_STUDENTS',
      value: '142',
      changeNoteKey: 'TEACHER.DASHBOARD.KPI.STUDENTS_CHANGE',
      changeType: 'up',
      badgeKey: 'TEACHER.DASHBOARD.KPI.INCREASE',
      iconType: 'students',
    },
    {
      id: 'class_avg',
      labelKey: 'TEACHER.DASHBOARD.KPI.CLASS_AVERAGE',
      value: '82%',
      changeNoteKey: 'TEACHER.DASHBOARD.KPI.AVERAGE_CHANGE',
      changeType: 'up',
      badgeKey: 'TEACHER.DASHBOARD.KPI.INCREASE',
      iconType: 'average',
    },
    {
      id: 'pending_exams',
      labelKey: 'TEACHER.DASHBOARD.KPI.PENDING_EXAMS',
      value: '4',
      changeNoteKey: 'TEACHER.DASHBOARD.KPI.EXAMS_CHANGE',
      iconType: 'exams',
    },
    {
      id: 'new_messages',
      labelKey: 'TEACHER.DASHBOARD.KPI.NEW_MESSAGES',
      value: '7',
      changeNoteKey: 'TEACHER.DASHBOARD.KPI.MESSAGES_CHANGE',
      iconType: 'messages',
    },
  ]);
  readonly kpiStats = this._kpiStats.asReadonly();

  private readonly _timeRange = signal<'week' | 'month' | 'quarter'>('week');
  readonly timeRange = this._timeRange.asReadonly();

  private readonly _weeklyChartPoints = signal<SubmissionChartPoint[]>([
    { dayNameKey: 'TEACHER.DAYS.SATURDAY', submissionsCount: 12, averageScore: 78 },
    { dayNameKey: 'TEACHER.DAYS.SUNDAY', submissionsCount: 18, averageScore: 80 },
    { dayNameKey: 'TEACHER.DAYS.MONDAY', submissionsCount: 15, averageScore: 79 },
    { dayNameKey: 'TEACHER.DAYS.TUESDAY', submissionsCount: 22, averageScore: 84 },
    { dayNameKey: 'TEACHER.DAYS.WEDNESDAY', submissionsCount: 19, averageScore: 82 },
    { dayNameKey: 'TEACHER.DAYS.THURSDAY', submissionsCount: 27, averageScore: 88 },
  ]);

  readonly chartMeta = computed<SubmissionsChartMeta>(() => {
    const range = this._timeRange();
    const points = this._weeklyChartPoints();
    return {
      totalSubmissions: 103,
      averagePerformance: 81,
      peakDayKey: 'TEACHER.DAYS.THURSDAY',
      timeRange: range,
      chartPoints: points,
    };
  });

  private readonly _studentsNeedingFollowup = signal<StudentNeedFollowup[]>([
    {
      id: 'st-1',
      studentName: 'ياسمين خالد',
      initials: 'يخ',
      courseName: 'الجبر والمثلثات',
      averageScore: 38,
      riskLevel: 'high',
    },
    {
      id: 'st-2',
      studentName: 'عمر السيد',
      initials: 'عا',
      courseName: 'الفيزياء الحديثة',
      averageScore: 44,
      riskLevel: 'high',
    },
    {
      id: 'st-3',
      studentName: 'نور محمود',
      initials: 'نم',
      courseName: 'الكيمياء العضوية',
      averageScore: 51,
      riskLevel: 'medium',
    },
    {
      id: 'st-4',
      studentName: 'كريم عبدالله',
      initials: 'كع',
      courseName: 'الجبر والمثلثات',
      averageScore: 53,
      riskLevel: 'medium',
    },
  ]);
  readonly studentsNeedingFollowup = this._studentsNeedingFollowup.asReadonly();

  private readonly _recentSubmissions = signal<RecentSubmission[]>([
    {
      id: 'sub-1',
      studentName: 'سارة أحمد',
      initials: 'سأ',
      timeAgoKey: 'TEACHER.DASHBOARD.TIME_AGO.14_MIN',
      examTitle: 'امتحان الجبر',
      score: 92,
      gradeType: 'excellent',
    },
    {
      id: 'sub-2',
      studentName: 'محمد إبراهيم',
      initials: 'مإ',
      timeAgoKey: 'TEACHER.DASHBOARD.TIME_AGO.32_MIN',
      examTitle: 'امتحان الفيزياء',
      score: 77,
      gradeType: 'good',
    },
    {
      id: 'sub-3',
      studentName: 'فاطمة عمر',
      initials: 'فع',
      timeAgoKey: 'TEACHER.DASHBOARD.TIME_AGO.55_MIN',
      examTitle: 'امتحان الكيمياء',
      score: 85,
      gradeType: 'excellent',
    },
    {
      id: 'sub-4',
      studentName: 'أحمد حسن',
      initials: 'أح',
      timeAgoKey: 'TEACHER.DASHBOARD.TIME_AGO.1_HOUR',
      examTitle: 'امتحان الجبر',
      score: 63,
      gradeType: 'average',
    },
  ]);
  readonly recentSubmissions = this._recentSubmissions.asReadonly();

  // ── Actions ────────────────────────────────────────────────────────────────
  setTimeRange(range: 'week' | 'month' | 'quarter'): void {
    this._timeRange.set(range);
  }

  getDashboardData(): Observable<boolean> {
    return of(true);
  }
}
