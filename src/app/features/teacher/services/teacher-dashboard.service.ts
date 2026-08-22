import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ClassroomService } from './classroom.service';
import { TeacherExamService } from './teacher-exam.service';
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
  private readonly classroomService = inject(ClassroomService);
  private readonly examService = inject(TeacherExamService);

  // 🟢 Signals State 🟢──────────────────────────────────────────────────────────
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
      id: 'new_messages',
      labelKey: 'TEACHER.DASHBOARD.KPI.NEW_MESSAGES',
      value: '0',
      changeNoteKey: '',
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
    return {
      totalSubmissions: 0,
      averagePerformance: 0,
      peakDayKey: '',
      timeRange: range,
      chartPoints: points,
    };
  });

  private readonly _studentsNeedingFollowup = signal<StudentNeedFollowup[]>([]);
  readonly studentsNeedingFollowup = this._studentsNeedingFollowup.asReadonly();

  private readonly _recentSubmissions = signal<RecentSubmission[]>([]);
  readonly recentSubmissions = this._recentSubmissions.asReadonly();

  // ── Actions ────────────────────────────────────────────────────────────────
  setTimeRange(range: 'week' | 'month' | 'quarter'): void {
    this._timeRange.set(range);
  }

  getDashboardData(): Observable<boolean> {
    forkJoin({
      classrooms: this.classroomService
        .getTeacherClassrooms(1, 100)
        .pipe(catchError(() => of(null))),
      exams: this.examService.getExams(undefined, 1, 100).pipe(catchError(() => of(null))),
    }).subscribe(({ classrooms, exams }) => {
      let activeStudents = 0;
      let totalExams = 0;

      if (classrooms && classrooms.items) {
        activeStudents = classrooms.items.reduce((acc, c) => acc + (c.studentCount || 0), 0);
      }

      if (exams) {
        if (Array.isArray(exams)) {
          totalExams = exams.length;
        } else if (
          typeof exams === 'object' &&
          exams !== null &&
          'totalCount' in exams &&
          typeof (exams as { totalCount: number }).totalCount === 'number'
        ) {
          totalExams = (exams as { totalCount: number }).totalCount;
        } else if (
          typeof exams === 'object' &&
          exams !== null &&
          'items' in exams &&
          Array.isArray((exams as { items: unknown[] }).items)
        ) {
          totalExams = (exams as { items: unknown[] }).items.length;
        }
      }

      this._kpiStats.update((stats) => {
        const newStats = [...stats];
        const studentIdx = newStats.findIndex((s) => s.id === 'active_students');
        if (studentIdx > -1) {
          newStats[studentIdx] = { ...newStats[studentIdx], value: activeStudents.toString() };
        }
        const examIdx = newStats.findIndex((s) => s.id === 'pending_exams');
        if (examIdx > -1) {
          newStats[examIdx] = { ...newStats[examIdx], value: totalExams.toString() };
        }
        return newStats;
      });
    });

    return of(true);
  }
}
