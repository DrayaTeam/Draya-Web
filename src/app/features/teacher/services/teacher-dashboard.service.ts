import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import type {
  TeacherKpiStat,
  TeacherAiAlertBanner,
  StudentNeedFollowup,
  RecentSubmission,
  SubmissionsChartMeta,
  SubmissionChartPoint,
  TeacherDashboardDto,
  TeacherUrgentAlert,
} from '../models/teacher-dashboard.model';

@Injectable({ providedIn: 'root' })
export class TeacherDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/dashboard/teacher`;

  // ðŸŸ¢ Signals State ðŸŸ¢â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private readonly _aiAlert = signal<TeacherAiAlertBanner | null>(null);
  readonly aiAlert = this._aiAlert.asReadonly();

  private readonly _kpiStats = signal<TeacherKpiStat[]>([
    {
      id: 'active_students',
      labelKey: 'TEACHER.DASHBOARD.KPI.ACTIVE_STUDENTS',
      value: '0',
      changeNoteKey: '',
      changeType: 'neutral',
      iconType: 'students',
    },
    {
      id: 'class_avg',
      labelKey: 'TEACHER.DASHBOARD.KPI.CLASS_AVERAGE',
      value: '0%',
      changeNoteKey: '',
      changeType: 'neutral',
      iconType: 'average',
    },
    {
      id: 'pending_exams',
      labelKey: 'TEACHER.DASHBOARD.KPI.PENDING_EXAMS',
      value: '0',
      changeNoteKey: '',
      iconType: 'exams',
    },
    {
      id: 'reports_ready',
      labelKey: 'TEACHER.DASHBOARD.KPI.REPORTS_READY',
      value: '0',
      changeNoteKey: 'TEACHER.DASHBOARD.KPI.REPORTS_READY_CHANGE',
      iconType: 'messages',
    },
  ]);
  readonly kpiStats = this._kpiStats.asReadonly();

  private readonly _timeRange = signal<'week' | 'month' | 'quarter'>('week');
  readonly timeRange = this._timeRange.asReadonly();

  private readonly _weeklyChartPoints = signal<SubmissionChartPoint[]>([]);

  readonly chartMeta = computed<SubmissionsChartMeta>(() => {
    const range = this._timeRange();
    const points = this._weeklyChartPoints();

    if (!points || points.length === 0) {
      return {
        totalSubmissions: 0,
        averagePerformance: 0,
        peakDayKey: 'SHARED.TIME.NONE',
        timeRange: range,
        chartPoints: points,
      };
    }

    const totalSubmissions = points.reduce((sum, p) => sum + p.submissionsCount, 0);
    const avgScoreSum = points.reduce((sum, p) => sum + p.averageScore, 0);
    const rawAverage = avgScoreSum / points.length;
    // DailySubmissionActivityDto.averageScore has no paired max/total field in
    // swagger, but every other score field in this API is confirmed already a
    // 0-100 percent (see NOTES_FOR_BACKEND_DEVS.md) -- trusting that same
    // convention here rather than guessing a /5 scale, which silently divided
    // a real percentage by 5 and rendered a number a fifth of the true average.
    const averagePerformance = Math.max(0, Math.min(100, Math.round(rawAverage)));

    const peakPoint = points.reduce((prev, current) =>
      prev.submissionsCount > current.submissionsCount ? prev : current,
    );

    return {
      totalSubmissions,
      averagePerformance,
      peakDayKey: peakPoint.dayNameKey,
      timeRange: range,
      chartPoints: points,
    };
  });

  private readonly _studentsNeedingFollowup = signal<StudentNeedFollowup[]>([]);
  readonly studentsNeedingFollowup = this._studentsNeedingFollowup.asReadonly();

  private readonly _urgentAlerts = signal<TeacherUrgentAlert[]>([]);
  readonly urgentAlerts = this._urgentAlerts.asReadonly();

  private readonly _recentSubmissions = signal<RecentSubmission[]>([]);
  readonly recentSubmissions = this._recentSubmissions.asReadonly();

  setTimeRange(range: 'week' | 'month' | 'quarter'): void {
    this._timeRange.set(range);
    // Real API might fetch data again. For now, it just triggers the computed.
  }

  // 🎯 Actions
  private normalizeScore(score: number | null | undefined, maxScore?: number | null): number {
    if (score == null) return 0;
    
    // If maxScore is provided and > 0, calculate percentage directly
    if (maxScore != null && maxScore > 0) {
      return Math.round((score / maxScore) * 100);
    }
    
    if (score <= 1.0 && score > 0) {
      return Math.round(score * 100);
    }
    return score;
  }

  getDashboardData(): Observable<boolean> {
    return this.http.get<TeacherDashboardDto>(this.baseUrl).pipe(
      map((data) => {
        // Update KPI Stats
        this._kpiStats.update((stats) => {
          const newStats = [...stats];
          const studentIdx = newStats.findIndex((s) => s.id === 'active_students');
          if (studentIdx > -1) {
            newStats[studentIdx] = {
              ...newStats[studentIdx],
              value: data.activeStudents.toString(),
            };
          }
          const avgIdx = newStats.findIndex((s) => s.id === 'class_avg');
          if (avgIdx > -1) {
            // Normalize fractional scores if any
            const normalizedClassAvg = this.normalizeScore(data.classAverage);
            const avg = Number.isInteger(normalizedClassAvg)
              ? normalizedClassAvg
              : Number(normalizedClassAvg).toFixed(1);
            newStats[avgIdx] = { ...newStats[avgIdx], value: `${avg}%` };
          }
          const examIdx = newStats.findIndex((s) => s.id === 'pending_exams');
          if (examIdx > -1) {
            newStats[examIdx] = {
              ...newStats[examIdx],
              value: data.examsAwaitingReview.toString(),
            };
          }
          const msgIdx = newStats.findIndex((s) => s.id === 'reports_ready');
          if (msgIdx > -1) {
            newStats[msgIdx] = {
              ...newStats[msgIdx],
              value: data.reportsReadyForReview.toString(),
            };
          }
          return newStats;
        });

        // Update AI Alert Banner if reports ready for review > 0
        if (data.reportsReadyForReview > 0) {
          this._aiAlert.set({
            titleKey: 'TEACHER.DASHBOARD.AI_REPORTS_READY',
            subtitleKey: 'TEACHER.DASHBOARD.AI_REPORTS_READY_DESC',
            reportsCount: data.reportsReadyForReview,
            ctaKey: 'TEACHER.DASHBOARD.VIEW_REPORTS',
          });
        } else {
          this._aiAlert.set(null);
        }

        // Update Students Needing Followup
        const studentsNeedingFollowup: StudentNeedFollowup[] = data.needsAttentionList.map((s) => {
          const names = s.studentName.split(' ');
          const initials =
            names.length > 1 ? names[0].charAt(0) + names[1].charAt(0) : names[0].charAt(0);

          const normalizedScore = this.normalizeScore(s.overallAverage);
          return {
            id: s.studentId,
            studentName: s.studentName,
            initials: initials.toUpperCase(),
            courseName: s.classroomName || 'â€”',
            averageScore: Number(normalizedScore.toFixed(1)),
            riskLevel: normalizedScore < 50 ? 'high' : 'medium',
          };
        });
        this._studentsNeedingFollowup.set(studentsNeedingFollowup);

        // Update Recent Submissions
        const recentSubmissions: RecentSubmission[] = data.recentSubmissions.map((s) => {
          const names = s.studentName.split(' ');
          const initials =
            names.length > 1 ? names[0].charAt(0) + names[1].charAt(0) : names[0].charAt(0);

          const normalizedScore = this.normalizeScore(s.score, s.maxScore);
          return {
            id: s.examAttemptId,
            studentName: s.studentName,
            initials: initials.toUpperCase(),
            timeAgoKey: 'SHARED.TIME.RECENTLY', // You can add logic to format date to timeAgo
            examTitle: s.examTitle,
            score: normalizedScore,
            gradeType:
              normalizedScore >= 85 ? 'excellent' : normalizedScore >= 65 ? 'good' : 'average',
          };
        });
        this._recentSubmissions.set(recentSubmissions);

        // Update Weekly Chart Points
        const chartPoints: SubmissionChartPoint[] = data.weeklySubmissionsActivity.map((w) => ({
          dayNameKey: w.dayOfWeek,
          submissionsCount: w.submissionsCount,
          averageScore: Number(this.normalizeScore(w.averageScore).toFixed(1)),
        }));
        this._weeklyChartPoints.set(chartPoints);

        // Derive Urgent Alerts
        const urgentAlerts: TeacherUrgentAlert[] = [];
        if (data.examsAwaitingReview > 0) {
          urgentAlerts.push({
            id: 'exams-awaiting',
            titleKey: 'TEACHER.DASHBOARD.ALERTS.EXAMS_WAITING',
            titleParams: { count: data.examsAwaitingReview },
            tagKey: 'TEACHER.DASHBOARD.ALERTS.TAG_DEADLINE',
            isDanger: true,
          });
        }
        if (data.reportsReadyForReview > 0) {
          urgentAlerts.push({
            id: 'reports-ready',
            titleKey: 'TEACHER.DASHBOARD.ALERTS.REPORTS_READY',
            titleParams: { count: data.reportsReadyForReview },
            tagKey: 'TEACHER.DASHBOARD.ALERTS.TAG_WARNING',
            isWarning: true,
          });
        }
        if (studentsNeedingFollowup.length >= 3) {
          urgentAlerts.push({
            id: 'students-at-risk',
            titleKey: 'TEACHER.DASHBOARD.ALERTS.STUDENTS_AT_RISK',
            titleParams: { count: studentsNeedingFollowup.length },
            tagKey: 'TEACHER.DASHBOARD.ALERTS.TAG_FOLLOWUP',
            isDanger: true,
          });
        }
        this._urgentAlerts.set(urgentAlerts);

        return true;
      }),
      catchError((error) => {
        console.error('Error fetching teacher dashboard data', error);
        return of(false);
      }),
    );
  }
}
