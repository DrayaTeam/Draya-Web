// src/app/core/services/student-exams.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { catchError, map, of, tap, Observable } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  StudentExamItem,
  StudentExamsHeaderInfo,
  ExamStatusType,
  StudentExamSummaryDto,
} from '../models/student-exam.model';

/**
 * Derives the lifecycle status of an exam from the server's own `attemptStatus`
 * first, falling back to date/attempt-count inference only when the server
 * hasn't told us (e.g. an older cached response, or a not-yet-started exam
 * where `attemptStatus` may legitimately be absent).
 */
export function deriveExamStatus(
  ex: StudentExamSummaryDto,
  now: Date = new Date(),
): ExamStatusType {
  const normAttemptStatus = (ex.attemptStatus || '').toLowerCase();

  if (normAttemptStatus === 'inprogress') {
    return 'in-progress';
  }

  if (normAttemptStatus === 'pendinggrading') {
    return 'pending-grading';
  }

  const isCompleted =
    Boolean(ex.hasSubmitted) ||
    normAttemptStatus === 'completed' ||
    (ex.usedAttempts !== undefined &&
      ex.allowedAttempts !== undefined &&
      ex.usedAttempts >= ex.allowedAttempts &&
      ex.usedAttempts > 0) ||
    (ex.latestScore !== undefined && ex.latestScore !== null);

  if (isCompleted) {
    return 'completed';
  }

  if (ex.startDate && new Date(ex.startDate) > now) {
    return 'scheduled';
  }

  if (ex.endDate && new Date(ex.endDate) < now) {
    return 'expired';
  }

  return 'available';
}

/**
 * Single source of truth for turning a raw backend score into a display
 * percentage — used by the exams list, the exam-taking result screen, and
 * the reports page so the same underlying score always renders identically.
 *
 * The backend does not reliably indicate whether a bare score field (no
 * accompanying max) is already a 0-100 percentage or raw points on some
 * other scale (see BACKEND_ISSUES_REPORT.md / NOTES_FOR_BACKEND_DEVS.md
 * Note 16). Guessing the scale from the number's magnitude (e.g. "<=10 means
 * out of 10") is unreliable by construction — a genuine 8% score is
 * indistinguishable from 8/10 — so this deliberately does NOT do that.
 * When an explicit total is known, it's used; otherwise the raw score is
 * treated as an already-computed percentage and only clamped to [0, 100].
 */
export function formatExamScoreDisplay(
  score: number | null | undefined,
  questionsCount?: number,
  maxScore?: number,
): { text: string; percent: number | null } {
  if (score === undefined || score === null) {
    return { text: 'تم التسليم', percent: null };
  }

  const rawScore = Number(score);
  const total = Number(maxScore || questionsCount || 0);

  // Only divide by an explicit total when the raw score is actually within
  // it (points-out-of-total). If it exceeds the total, the two don't agree
  // on units — treating rawScore as already a percentage is the safer
  // fallback than dividing into a >100% result.
  const percent =
    total > 0 && rawScore <= total
      ? Math.max(0, Math.min(100, Math.round((rawScore / total) * 100)))
      : Math.max(0, Math.min(100, Math.round(rawScore)));

  return { text: `الدرجة: ${percent}%`, percent };
}

@Injectable({ providedIn: 'root' })
export class StudentExamsService extends ApiBaseService {
  readonly headerInfo = signal<StudentExamsHeaderInfo>({
    badgeText: 'مركز التقويم والاختبارات التفاعلية',
    mainHeading: 'الامتحانات والواجبات المجدولة',
    subtitleText:
      'استعرض الامتحانات والواجبات المحددة لك من قبل معلميك مع متابعة درجات التصحيح الفوري.',
  });

  readonly selectedFilter = signal<'all' | ExamStatusType>('all');
  readonly searchQuery = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly exams = signal<StudentExamItem[]>([]);

  readonly filteredExams = computed(() => {
    const filter = this.selectedFilter();
    const query = this.searchQuery().trim().toLowerCase();
    let list = this.exams();

    if (filter !== 'all') {
      list = list.filter((ex) => ex.status === filter);
    }

    if (query) {
      list = list.filter(
        (ex) =>
          ex.title.toLowerCase().includes(query) ||
          ex.subjectName.toLowerCase().includes(query) ||
          (ex.teacherName ? ex.teacherName.toLowerCase().includes(query) : false),
      );
    }

    return list;
  });

  /**
   * Fetches raw student exams as an observable for background discovery polling.
   */
  fetchExams(page = 1, pageSize = 10): Observable<StudentExamSummaryDto[]> {
    return this.get<StudentExamSummaryDto[] | { items: StudentExamSummaryDto[] }>(
      '/students/exams',
      { page, pageSize },
    ).pipe(
      map((res) => (Array.isArray(res) ? res : res?.items || [])),
      catchError(() => of([])),
    );
  }

  /**
   * Loads all exams available to the student from:
   * GET /api/v1/students/exams
   */
  loadExams(classroomId?: string, page = 1, pageSize = 50): void {
    this.loading.set(true);

    const directParams: Record<string, string | number> = { page, pageSize };
    if (classroomId) {
      directParams['classroomId'] = classroomId;
    }

    this.get<StudentExamSummaryDto[] | { items: StudentExamSummaryDto[] }>(
      '/students/exams',
      directParams,
    )
      .pipe(
        map((res) => (Array.isArray(res) ? res : res?.items || [])),
        tap((combined) => {
          this.loading.set(false);

          const colors = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];
          const now = new Date();

          const mapped: StudentExamItem[] = combined.map((ex, idx) => {
            const status = deriveExamStatus(ex, now);
            const attempts = ex.attempts || [];
            const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : undefined;
            const needsTeacherReview = attempts.some((a) => a.needsTeacherReview);

            let statusLabel = 'متاح للحل الآن 🔥';
            let secondaryDetailText = 'جاهز للبدء';

            const scoreInfo = formatExamScoreDisplay(
              ex.latestScore,
              ex.questionsCount || ex.totalQuestions,
              ex.maxScore,
            );

            switch (status) {
              case 'completed':
                statusLabel = 'مكتمل ومصحح ✅';
                secondaryDetailText = scoreInfo.text;
                break;
              case 'in-progress':
                statusLabel = 'جلسة جارية ⏳';
                secondaryDetailText = 'متابعة الحل';
                break;
              case 'pending-grading':
                statusLabel = 'قيد التصحيح 🧠';
                secondaryDetailText = 'جارٍ تقييم إجاباتك';
                break;
              case 'scheduled': {
                const startD = ex.startDate ? new Date(ex.startDate) : null;
                statusLabel = 'مجدول لاحقاً ⏳';
                secondaryDetailText = startD
                  ? `يبدأ ${startD.toLocaleDateString('ar-EG', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : 'مجدول لاحقاً';
                break;
              }
              case 'expired':
                statusLabel = 'انتهى موعد الامتحان ⛔';
                secondaryDetailText = 'انتهت الفترة';
                break;
              default:
                if (ex.endDate) {
                  const endD = new Date(ex.endDate);
                  secondaryDetailText = `ينتهي ${endD.toLocaleDateString('ar-EG', {
                    month: 'short',
                    day: 'numeric',
                  })}`;
                }
                break;
            }

            return {
              id: ex.id,
              title: ex.title || ex.topic || 'امتحان تفاعلي',
              teacherName: ex.teacherName || undefined,
              subjectName: ex.subjectName || ex.topic || 'المنهج الدراسي',
              status,
              statusLabel,
              durationMinutes: ex.durationMinutes || 45,
              secondaryDetailText,
              cornerTintBg: colors[idx % colors.length],
              allowedAttempts: ex.allowedAttempts ?? 1,
              attemptsTaken: ex.usedAttempts ?? attempts.length,
              scorePercent: scoreInfo.percent ?? ex.latestScore,
              latestAttemptId: latestAttempt?.id,
              needsTeacherReview,
            };
          });

          this.exams.set(mapped);
        }),
        catchError(() => {
          this.loading.set(false);
          this.exams.set([]);
          return of(null);
        }),
      )
      .subscribe();
  }

  markExamAsCompleted(examId: string, score?: number): void {
    this.exams.update((list) =>
      list.map((ex) =>
        ex.id === examId
          ? {
              ...ex,
              status: 'pending-grading' as ExamStatusType,
              statusLabel: 'قيد التصحيح 🧠',
              secondaryDetailText: score !== undefined ? `الدرجة: ${score}%` : 'تم التسليم',
              scorePercent: score ?? ex.scorePercent,
            }
          : ex,
      ),
    );
  }
}
