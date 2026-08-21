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
    studentName: 'الطالب',
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

  // ── Public readonly signals ───────────────────────────────────────────────
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly summary = this._summary.asReadonly();
  readonly enrolledCourses = this._enrolledCourses.asReadonly();
  readonly upcomingExams = this._upcomingExams.asReadonly();
  readonly weaknessTopics = this._weaknessTopics.asReadonly();

  // ── API call ───────────────────────────────────────────────────────────────

  /**
   * Loads dashboard data by querying GET /dashboard/student and enriching
   * with /auth/me, /classrooms, /students/exams, and /students/materials.
   */
  loadDashboard(): void {
    this._loading.set(true);
    this._error.set(null);

    forkJoin({
      dash: this.get<StudentDashboardApiResponse>('/dashboard/student').pipe(
        catchError(() => of(null)),
      ),
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
          studentProgress?:
            | number
            | {
                completedCount?: number;
                totalCount?: number;
                percentage?: number;
                completedLessons?: number;
                totalLessons?: number;
                progressPercent?: number;
              };
          imageUrl?: string;
        }[];
      }>('/classrooms').pipe(catchError(() => of(null))),
      exams: this.get<
        | { id: string; title?: string; topic?: string; startDate?: string }[]
        | { items: { id: string; title?: string; topic?: string; startDate?: string }[] }
      >('/students/exams').pipe(catchError(() => of(null))),
      materials: this.get<{ totalCount?: number }>('/students/materials').pipe(
        catchError(() => of(null)),
      ),
    })
      .pipe(
        tap(({ dash, me, classrooms, exams, materials }) => {
          const rawEnrolled = classrooms?.items || [];
          const rawExams = Array.isArray(exams) ? exams : exams?.items || [];

          const enrolledList: EnrolledCourseItem[] =
            dash?.enrolledCourses && dash.enrolledCourses.length > 0
              ? dash.enrolledCourses.map((c, i) => ({
                  id: c.id,
                  title: c.title,
                  teacherName: c.teacherName,
                  subjectName: c.subjectName,
                  completedLessons: c.completedLessons ?? 0,
                  totalLessons: c.totalLessons ?? 0,
                  progressPercent: c.progressPercent ?? 0,
                  thumbnailUrl: c.thumbnailUrl ?? 'assets/images/default-classroom.svg',
                  progressGradient: COURSE_GRADIENTS[i % COURSE_GRADIENTS.length],
                }))
              : rawEnrolled.map((c, i) => {
                  const prog =
                    typeof c.studentProgress === 'object' && c.studentProgress !== null
                      ? c.studentProgress
                      : null;
                  const progressPercent =
                    typeof c.studentProgress === 'number'
                      ? c.studentProgress
                      : (prog?.progressPercent ?? prog?.percentage ?? 0);
                  const totalLessons = prog?.totalLessons ?? prog?.totalCount ?? 1;
                  const completedLessons = prog?.completedLessons ?? prog?.completedCount ?? 0;

                  return {
                    id: c.classroomId || c.id || `crs-${i}`,
                    title: c.name || 'الفصل الدراسي',
                    teacherName: c.teacherName || 'أستاذ المادة',
                    subjectName: c.subjectName || 'المنهج الدراسي',
                    completedLessons: isNaN(completedLessons) ? 0 : completedLessons,
                    totalLessons: isNaN(totalLessons) || totalLessons === 0 ? 1 : totalLessons,
                    progressPercent: isNaN(progressPercent) ? 0 : progressPercent,
                    thumbnailUrl: c.imageUrl || 'assets/images/default-classroom.svg',
                    progressGradient: COURSE_GRADIENTS[i % COURSE_GRADIENTS.length],
                  };
                });

          const upcomingList: UpcomingExamItem[] =
            dash?.upcomingExams && dash.upcomingExams.length > 0
              ? dash.upcomingExams.map((e) => ({
                  id: e.id,
                  title: e.title,
                  timeText: e.timeText ?? 'متاح للحل الآن',
                  tagText: e.isImportant ? 'هام' : 'مراجعة',
                  borderMarkerColor: examBorderColor(e.isImportant),
                  isImportant: !!e.isImportant,
                }))
              : rawExams.map((e, idx) => ({
                  id: e.id,
                  title: e.title || 'امتحان تفاعلي',
                  timeText: e.startDate
                    ? `يبدأ ${new Date(e.startDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}`
                    : 'متاح للحل الآن',
                  tagText: idx === 0 ? 'هام' : 'تقييم',
                  borderMarkerColor: examBorderColor(idx === 0),
                  isImportant: idx === 0,
                }));

          const weaknessList: WeaknessTopicItem[] = (dash?.weaknessTopics ?? []).map((w) => ({
            id: w.id,
            topicTitle: w.topicTitle,
            scorePercent: w.scorePercent ?? 0,
            barColor: weaknessBarColor(w.scorePercent ?? 0),
          }));

          const studentName = me?.fullName?.split(' ')[0] || dash?.studentName || 'الطالب';

          this._summary.set({
            studentName,
            currentDateText: formatArabicDate(new Date()),
            scheduledExamsCount: dash?.scheduledExamsCount ?? upcomingList.length,
            streakDays: dash?.streakDays ?? 1,
            cumulativeAverage: dash?.cumulativeAverage ?? 0,
            completedLessonsCount: materials?.totalCount ?? dash?.completedLessonsCount ?? 0,
            subscribedPackagesCount: dash?.subscribedPackagesCount ?? enrolledList.length,
            monthlyGrowthPercent: dash?.monthlyGrowthPercent ?? 0,
            percentileRanking: dash?.percentileRanking ?? 0,
          });

          this._enrolledCourses.set(enrolledList);
          this._upcomingExams.set(upcomingList);
          this._weaknessTopics.set(weaknessList);
          this._loading.set(false);
        }),
        catchError(() => {
          this._loading.set(false);
          this._error.set('تعذر تحميل بيانات لوحة التحكم');
          return of(null);
        }),
      )
      .subscribe();
  }
}
