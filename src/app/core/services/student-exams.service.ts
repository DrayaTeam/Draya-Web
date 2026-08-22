// src/app/core/services/student-exams.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  StudentExamItem,
  StudentExamsHeaderInfo,
  ExamStatusType,
} from '../models/student-exam.model';

export interface ExamDto {
  id: string;
  classroomId?: string;
  sectionId?: string;
  title?: string;
  topic?: string;
  durationMinutes?: number;
  startDate?: string;
  endDate?: string | null;
  allowedAttempts?: number;
  usedAttempts?: number;
  hasSubmitted?: boolean;
  attemptStatus?: 'NotStarted' | 'InProgress' | 'PendingGrading' | 'Completed';
  latestScore?: number;
  questionsCount?: number;
  createdAt?: string;
  teacherName?: string;
  subjectName?: string;
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
          ex.teacherName.toLowerCase().includes(query),
      );
    }

    return list;
  });

  /**
   * Loads all exams available to the student from:
   * 1. GET /api/v1/students/exams (Direct & global exams)
   * 2. GET /api/v1/exams?classroomId=... (Exams attached to enrolled classrooms and sections)
   */
  loadExams(classroomId?: string, page = 1, pageSize = 50): void {
    this.loading.set(true);

    const directParams: Record<string, string | number> = { page, pageSize };
    if (classroomId) {
      directParams['classroomId'] = classroomId;
    }

    // 1. Direct student exams stream
    const directExams$ = this.get<ExamDto[] | { items: ExamDto[] }>(
      '/students/exams',
      directParams,
    ).pipe(
      map((res) => (Array.isArray(res) ? res : res?.items || [])),
      catchError(() => of([] as ExamDto[])),
    );

    // 2. Enrolled classrooms & their section exams stream
    const classroomExams$ = classroomId
      ? this.get<ExamDto[] | { items: ExamDto[] }>(`/exams`, { classroomId }).pipe(
          map((res) => (Array.isArray(res) ? res : res?.items || [])),
          catchError(() => of([] as ExamDto[])),
        )
      : this.get<{ items?: { classroomId?: string; id?: string; name?: string; teacherName?: string; subjectName?: string }[] }>(
          '/classrooms',
        ).pipe(
          catchError(() => of(null)),
          switchMap((classroomsRes) => {
            const classrooms = classroomsRes?.items || [];
            if (classrooms.length === 0) return of([] as ExamDto[]);

            const examRequests = classrooms.map((c) => {
              const cId = c.classroomId || c.id;
              if (!cId) return of([] as ExamDto[]);
              return this.get<ExamDto[] | { items: ExamDto[] }>(`/exams`, { classroomId: cId }).pipe(
                map((res) => {
                  const items = Array.isArray(res) ? res : res?.items || [];
                  return items.map((e) => ({
                    ...e,
                    classroomId: cId,
                    teacherName: e.teacherName || c.teacherName,
                    subjectName: e.subjectName || c.subjectName || c.name,
                  }));
                }),
                catchError(() => of([] as ExamDto[])),
              );
            });

            return forkJoin(examRequests).pipe(map((nested) => nested.flat()));
          }),
        );

    forkJoin({
      direct: directExams$,
      fromClassrooms: classroomExams$,
    })
      .pipe(
        tap(({ direct, fromClassrooms }) => {
          this.loading.set(false);

          // Deduplicate all exams by ID
          const seen = new Set<string>();
          const combined: ExamDto[] = [];

          for (const ex of [...direct, ...fromClassrooms]) {
            if (ex?.id && !seen.has(ex.id)) {
              seen.add(ex.id);
              combined.push(ex);
            }
          }

          const colors = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];
          const now = new Date();

          const mapped: StudentExamItem[] = combined.map((ex, idx) => {
            let status: ExamStatusType = 'available';
            let statusLabel = 'متاح للحل الآن 🔥';
            let secondaryDetailText = 'جاهز للبدء';

            const normAttemptStatus = (ex.attemptStatus || '').toLowerCase();
            if (
              ex.hasSubmitted ||
              normAttemptStatus === 'completed' ||
              normAttemptStatus === 'pendinggrading' ||
              (ex.usedAttempts !== undefined &&
                ex.allowedAttempts !== undefined &&
                ex.usedAttempts >= ex.allowedAttempts &&
                ex.usedAttempts > 0)
            ) {
              status = 'completed';
              statusLabel = 'مكتمل ومصحح ✅';
              secondaryDetailText =
                ex.latestScore !== undefined && ex.latestScore !== null
                  ? `الدرجة: ${ex.latestScore}%`
                  : 'تم التسليم';
            } else if (normAttemptStatus === 'inprogress') {
              status = 'available';
              statusLabel = 'جلسة جارية ⏳';
              secondaryDetailText = 'متابعة الحل';
            } else if (ex.startDate && new Date(ex.startDate) > now) {
              status = 'scheduled';
              const startD = new Date(ex.startDate);
              statusLabel = 'مجدول لاحقاً ⏳';
              secondaryDetailText = `يبدأ ${startD.toLocaleDateString('ar-EG', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}`;
            } else if (ex.endDate && new Date(ex.endDate) < now) {
              status = 'expired';
              statusLabel = 'انتهى موعد الامتحان ⛔';
              secondaryDetailText = 'انتهت الفترة';
            } else if (ex.endDate) {
              const endD = new Date(ex.endDate);
              secondaryDetailText = `ينتهي ${endD.toLocaleDateString('ar-EG', {
                month: 'short',
                day: 'numeric',
              })}`;
            }

            return {
              id: ex.id,
              title: ex.title || ex.topic || 'امتحان تفاعلي',
              teacherName: ex.teacherName || 'أستاذ المادة',
              subjectName: ex.subjectName || ex.topic || 'المنهج الدراسي',
              status,
              statusLabel,
              durationMinutes: ex.durationMinutes || 45,
              secondaryDetailText,
              cornerTintBg: colors[idx % colors.length],
              allowedAttempts: ex.allowedAttempts ?? 1,
              attemptsTaken: ex.usedAttempts ?? 0,
              scorePercent: ex.latestScore,
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
}
