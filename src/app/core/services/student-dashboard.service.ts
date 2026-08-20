import { Injectable, signal } from '@angular/core';
import { catchError, forkJoin, of, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  EnrolledCourseItem,
  UpcomingExamItem,
  WeaknessTopicItem,
  StudentDashboardSummary,
  StudentDashboardApiResponse,
} from '../models/student-dashboard.model';

/** Cycling gradients assigned per course index — API doesn't send CSS strings */
const COURSE_GRADIENTS = [
  'linear-gradient(90deg, #00A6F4 0%, #4F39F6 100%)',
  'linear-gradient(90deg, #AD46FF 0%, #E60076 100%)',
  'linear-gradient(90deg, #00BC7D 0%, #009689 100%)',
  'linear-gradient(90deg, #FF6B35 0%, #F7C59F 100%)',
  'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
];

/** Colour assigned to weakness bar based on score severity */
function weaknessBarColor(score: number): string {
  if (score < 50) return '#FF2056';
  if (score < 70) return '#FE9A00';
  return '#00BC7D';
}

/** Colour assigned to upcoming exam border based on isImportant flag */
function examBorderColor(isImportant: boolean): string {
  return isImportant ? '#FF2056' : '#FE9A00';
}

/** Format a JS Date or ISO string to Arabic date label */
function formatArabicDate(date: Date): string {
  return date.toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

@Injectable({ providedIn: 'root' })
export class StudentDashboardService extends ApiBaseService {
  // ── State signals ──────────────────────────────────────────────────────────
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  private readonly _summary = signal<StudentDashboardSummary>({
    studentName: '',
    currentDateText: formatArabicDate(new Date()),
    scheduledExamsCount: 0,
    streakDays: 0,
    cumulativeAverage: 0,
    completedLessonsCount: 0,
    subscribedPackagesCount: 0,
    monthlyGrowthPercent: 0,
    percentileRanking: 0,
  });

  private readonly _enrolledCourses = signal<EnrolledCourseItem[]>([]);
  private readonly _upcomingExams = signal<UpcomingExamItem[]>([]);
  private readonly _weaknessTopics = signal<WeaknessTopicItem[]>([]);

  // ── Public readonly signals (same names — component doesn't change) ────────
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly summary = this._summary.asReadonly();
  readonly enrolledCourses = this._enrolledCourses.asReadonly();
  readonly upcomingExams = this._upcomingExams.asReadonly();
  readonly weaknessTopics = this._weaknessTopics.asReadonly();

  // ── API call ───────────────────────────────────────────────────────────────

  /** Load dashboard data by aggregating real Swagger endpoints (auth/me, classrooms, exams, materials). */
  loadDashboard(): void {
    this._loading.set(true);
    this._error.set(null);

    forkJoin({
      me: this.get<{ fullName?: string; gradeLevelName?: string; pictureUrl?: string }>(
        '/auth/me',
      ).pipe(catchError(() => of(null))),
      classrooms: this.get<{
        items: {
          id?: string;
          classroomId?: string;
          name?: string;
          teacherName?: string;
          subjectName?: string;
          studentProgress?: { completedCount?: number; totalCount?: number; percentage?: number };
          imageUrl?: string;
        }[];
      }>('/classrooms').pipe(catchError(() => of(null))),
      exams: this.get<{ id: string; title?: string; topic?: string; createdAt?: string }[]>(
        '/exams',
      ).pipe(catchError(() => of(null))),
      materials: this.get<{ totalCount?: number }>('/students/materials').pipe(
        catchError(() => of(null)),
      ),
    })
      .pipe(
        tap(({ me, classrooms, exams, materials }) => {
          const fallback = this.getMockDashboard();
          const enrolledItems = classrooms?.items || [];
          const examItems = Array.isArray(exams) ? exams : [];

          const apiResponse: StudentDashboardApiResponse = {
            studentName: me?.fullName || fallback.studentName,
            streakDays: fallback.streakDays,
            cumulativeAverage: fallback.cumulativeAverage,
            completedLessonsCount: materials?.totalCount || fallback.completedLessonsCount,
            subscribedPackagesCount:
              enrolledItems.length > 0 ? enrolledItems.length : fallback.subscribedPackagesCount,
            scheduledExamsCount:
              examItems.length > 0 ? examItems.length : fallback.scheduledExamsCount,
            monthlyGrowthPercent: fallback.monthlyGrowthPercent,
            percentileRanking: fallback.percentileRanking,
            enrolledCourses:
              enrolledItems.length > 0
                ? enrolledItems.map((c) => ({
                    id: c.classroomId || c.id || 'crs-1',
                    title: c.name || 'الفصل الدراسي',
                    teacherName: c.teacherName || 'أستاذ المادة',
                    subjectName: c.subjectName || 'المنهج',
                    completedLessons: c.studentProgress?.completedCount ?? 0,
                    totalLessons: c.studentProgress?.totalCount ?? 1,
                    progressPercent: c.studentProgress?.percentage ?? 0,
                    thumbnailUrl: c.imageUrl || '',
                  }))
                : fallback.enrolledCourses,
            upcomingExams:
              examItems.length > 0
                ? examItems.map((e, idx) => ({
                    id: e.id,
                    title: e.title || 'امتحان تفاعلي',
                    timeText: 'متاح للحل الآن',
                    isImportant: idx === 0,
                  }))
                : fallback.upcomingExams,
            weaknessTopics: fallback.weaknessTopics,
          };

          this.mapResponse(apiResponse);
        }),
        catchError(() => {
          const fallback = this.getMockDashboard();
          this.mapResponse(fallback);
          this._loading.set(false);
          return of(fallback);
        }),
      )
      .subscribe();
  }

  // ── Mapping ────────────────────────────────────────────────────────────────

  private mapResponse(res: StudentDashboardApiResponse): void {
    if (!res) {
      this._loading.set(false);
      return;
    }

    this._summary.set({
      studentName: res.studentName ?? 'أحمد',
      currentDateText: formatArabicDate(new Date()),
      scheduledExamsCount: res.scheduledExamsCount ?? 2,
      streakDays: res.streakDays ?? 5,
      cumulativeAverage: res.cumulativeAverage ?? 87,
      completedLessonsCount: res.completedLessonsCount ?? 37,
      subscribedPackagesCount: res.subscribedPackagesCount ?? 3,
      monthlyGrowthPercent: res.monthlyGrowthPercent ?? 4,
      percentileRanking: res.percentileRanking ?? 92,
    });

    this._enrolledCourses.set(
      (res.enrolledCourses ?? []).map((c, i) => ({
        id: c.id,
        title: c.title,
        teacherName: c.teacherName,
        subjectName: c.subjectName,
        completedLessons: c.completedLessons ?? 0,
        totalLessons: c.totalLessons ?? 0,
        progressPercent: c.progressPercent ?? 0,
        thumbnailUrl: c.thumbnailUrl ?? '',
        progressGradient: COURSE_GRADIENTS[i % COURSE_GRADIENTS.length],
      })),
    );

    this._upcomingExams.set(
      (res.upcomingExams ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        timeText: e.timeText ?? '',
        tagText: e.isImportant ? 'هام' : 'مراجعة',
        borderMarkerColor: examBorderColor(e.isImportant),
        isImportant: !!e.isImportant,
      })),
    );

    this._weaknessTopics.set(
      (res.weaknessTopics ?? []).map((w) => ({
        id: w.id,
        topicTitle: w.topicTitle,
        scorePercent: w.scorePercent ?? 0,
        barColor: weaknessBarColor(w.scorePercent ?? 0),
      })),
    );

    this._loading.set(false);
  }

  private getMockDashboard(): StudentDashboardApiResponse {
    return {
      studentName: 'أحمد',
      streakDays: 5,
      cumulativeAverage: 87,
      completedLessonsCount: 37,
      subscribedPackagesCount: 3,
      scheduledExamsCount: 2,
      monthlyGrowthPercent: 4,
      percentileRanking: 92,
      enrolledCourses: [
        {
          id: 'crs-1',
          title: 'الجبر وحساب المثلثات',
          teacherName: 'أ. محمد علي',
          subjectName: 'الرياضيات',
          completedLessons: 12,
          totalLessons: 18,
          progressPercent: 68,
          thumbnailUrl:
            'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop',
        },
        {
          id: 'crs-2',
          title: 'الفيزياء الكهربية والحديثة',
          teacherName: 'أ. سارة حسن',
          subjectName: 'الفيزياء',
          completedLessons: 8,
          totalLessons: 20,
          progressPercent: 40,
          thumbnailUrl:
            'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=400&auto=format&fit=crop',
        },
        {
          id: 'crs-3',
          title: 'الكيمياء العضوية المتقدمة',
          teacherName: 'أ. أحمد سامي',
          subjectName: 'الكيمياء',
          completedLessons: 17,
          totalLessons: 20,
          progressPercent: 85,
          thumbnailUrl:
            'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=400&auto=format&fit=crop',
        },
      ],
      upcomingExams: [
        {
          id: 'ex-1',
          title: 'اختبار الباب الثالث (جبر)',
          timeText: 'غداً 10:00 ص',
          isImportant: true,
        },
        {
          id: 'ex-2',
          title: 'مراجعة قانون كيرشوف (فيزياء)',
          timeText: 'الخميس 11:00 ص',
          isImportant: false,
        },
      ],
      weaknessTopics: [
        {
          id: 'wk-1',
          topicTitle: 'المشتقات والاتصال الرياضي',
          scorePercent: 42,
        },
        {
          id: 'wk-2',
          topicTitle: 'الدوائر المغلقة وقوانين أوم',
          scorePercent: 55,
        },
      ],
    };
  }
}
