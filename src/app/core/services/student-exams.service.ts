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
  questionsCount?: number;
  createdAt?: string;
  teacherName?: string;
}

const DEFAULT_EXAMS: StudentExamItem[] = [
  {
    id: 'ex-1',
    title: 'امتحان الجبر والتباديل والتوافيق',
    teacherName: 'أ. أحمد السيد',
    subjectName: 'الرياضيات',
    status: 'available',
    statusLabel: 'متاح للحل الآن 🔥',
    durationMinutes: 45,
    secondaryDetailText: 'جاهز للبدء',
    cornerTintBg: '#0EA5E9',
  },
  {
    id: 'ex-2',
    title: 'مراجعة قوانين نيوتن والكهربية',
    teacherName: 'أ. سارة حسن',
    subjectName: 'الفيزياء',
    status: 'scheduled',
    statusLabel: 'مجدول لاحقاً ⏳',
    durationMinutes: 60,
    secondaryDetailText: 'الخميس القادم 11:00 ص',
    cornerTintBg: '#8B5CF6',
  },
  {
    id: 'ex-3',
    title: 'امتحان الفصل الدراسي الأول التراكمي',
    teacherName: 'أ. أحمد السيد',
    subjectName: 'الرياضيات',
    status: 'completed',
    statusLabel: 'مكتمل وحاصل على درجة',
    durationMinutes: 90,
    secondaryDetailText: 'الدرجة: 85%',
    scorePercent: 85,
    cornerTintBg: '#10B981',
  },
];

@Injectable({ providedIn: 'root' })
export class StudentExamsService extends ApiBaseService {
  readonly headerInfo = signal<StudentExamsHeaderInfo>({
    badgeText: 'مركز التقويم والاختبارات التفاعلية',
    mainHeading: 'الامتحانات والواجبات المجدولة',
    subtitleText:
      'استعرض الامتحانات والواجبات المحددة لك من قبل معلميك مع متابعة درجات التصحيح الفوري.',
  });

  readonly selectedFilter = signal<'all' | ExamStatusType>('all');
  readonly loading = signal<boolean>(false);
  readonly exams = signal<StudentExamItem[]>(DEFAULT_EXAMS);

  readonly filteredExams = computed(() => {
    const filter = this.selectedFilter();
    if (filter === 'all') return this.exams();
    return this.exams().filter((ex) => ex.status === filter);
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
          if (rawItems.length > 0) {
            const colors = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B'];
            const now = new Date();
            const mapped: StudentExamItem[] = rawItems.map((ex, idx) => {
              let status: ExamStatusType = 'available';
              let statusLabel = 'متاح للحل الآن 🔥';
              let secondaryDetailText = 'جاهز للبدء';

              if (ex.startDate && new Date(ex.startDate) > now) {
                status = 'scheduled';
                const startD = new Date(ex.startDate);
                statusLabel = 'مجدول لاحقاً ⏳';
                secondaryDetailText = `يبدأ ${startD.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
              } else if (ex.endDate && new Date(ex.endDate) < now) {
                status = 'completed';
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
              };
            });
            this.exams.set(mapped);
          }
        }),
        catchError(() => {
          this.loading.set(false);
          return of(null);
        }),
      )
      .subscribe();
  }
}
