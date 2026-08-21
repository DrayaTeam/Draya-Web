// src/app/core/services/student-exams.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
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
   * Loads the student's scheduled and active exams from GET /api/v1/students/exams.
   */
  loadExams(classroomId?: string, page = 1, pageSize = 20): void {
    this.loading.set(true);
    const params: Record<string, string | number> = { page, pageSize };
    if (classroomId) {
      params['classroomId'] = classroomId;
    }

    this.get<ExamDto[] | { items: ExamDto[] }>('/students/exams', params)
      .pipe(
        tap((res) => {
          this.loading.set(false);
          const rawItems = Array.isArray(res) ? res : res?.items || [];
          const colors = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B'];
          const now = new Date();
          const mapped: StudentExamItem[] = rawItems.map((ex, idx) => {
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
              secondaryDetailText = `يبدأ ${startD.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
            } else if (ex.endDate && new Date(ex.endDate) < now) {
              status = 'expired';
              statusLabel = 'انتهى موعد الامتحان ⛔';
              secondaryDetailText = 'انتهت الفترة';
            } else if (ex.endDate) {
              const endD = new Date(ex.endDate);
              secondaryDetailText = `ينتهي ${endD.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}`;
            }

            return {
              id: ex.id,
              title: ex.title || 'امتحان تفاعلي',
              teacherName: ex.teacherName || 'أستاذ المادة',
              subjectName: ex.topic || 'المنهج الدراسي',
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
