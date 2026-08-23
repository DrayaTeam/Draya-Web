// src/app/core/services/teacher-directory.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { catchError, of, map } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  TeacherDirectoryItem,
  TeacherSubjectCategory,
  SubjectFilterOption,
  TeacherProfile,
} from '../models/teacher.model';

const CARD_GRADIENTS = [
  'linear-gradient(135deg, rgba(0, 166, 244, 0.1) 0%, rgba(97, 95, 255, 0.05) 100%), #FFFFFF',
  'linear-gradient(135deg, rgba(173, 70, 255, 0.1) 0%, rgba(246, 51, 154, 0.05) 100%), #FFFFFF',
  'linear-gradient(135deg, rgba(0, 188, 125, 0.1) 0%, rgba(0, 187, 167, 0.05) 100%), #FFFFFF',
  'linear-gradient(135deg, rgba(255, 32, 86, 0.1) 0%, rgba(254, 154, 0, 0.05) 100%), #FFFFFF',
];

const BLUR_COLORS = ['#0EA5E9', '#8B5CF6', '#10B981', '#F43F5E'];

const BADGE_STYLES = [
  { bg: '#DFF2FE', border: '#B8E6FE', text: '#00598A' },
  { bg: '#F3E8FF', border: '#E9D4FF', text: '#6E11B0' },
  { bg: '#D0FAE5', border: '#A4F4CF', text: '#006045' },
  { bg: '#FFE4E6', border: '#FFCCD3', text: '#A50036' },
];

function inferCategory(subject: string): TeacherSubjectCategory {
  if (!subject) return 'all';
  const s = subject.toLowerCase();
  if (
    s.includes('رياض') ||
    s.includes('math') ||
    s.includes('جبر') ||
    s.includes('هندس') ||
    s.includes('تفاضل')
  )
    return 'math';
  if (s.includes('فيز') || s.includes('phys')) return 'physics';
  if (s.includes('كيم') || s.includes('chem')) return 'chemistry';
  if (s.includes('أحياء') || s.includes('احياء') || s.includes('bio') || s.includes('جيولوج'))
    return 'biology';
  return 'all';
}

function getSubjectEmoji(subject: string): string {
  if (!subject) return '📚';
  const s = subject.toLowerCase();
  if (
    s.includes('رياض') ||
    s.includes('math') ||
    s.includes('جبر') ||
    s.includes('هندس') ||
    s.includes('تفاضل') ||
    s.includes('حساب')
  ) {
    return '📐';
  }
  if (s.includes('فيز') || s.includes('phys')) return '⚡';
  if (s.includes('كيم') || s.includes('chem')) return '🧪';
  if (s.includes('أحياء') || s.includes('احياء') || s.includes('bio') || s.includes('جيولوج')) return '🧬';
  if (s.includes('عرب') || s.includes('نحو') || s.includes('بلاغ') || s.includes('لغة عربية')) return '📖';
  if (s.includes('إنجليز') || s.includes('انجليز') || s.includes('english') || s.includes('لغة إنجليزية')) return '🔤';
  if (s.includes('فرنس') || s.includes('french') || s.includes('français')) return '🇫🇷';
  if (s.includes('ألمان') || s.includes('المان') || s.includes('german') || s.includes('deutsch')) return '🇩🇪';
  if (s.includes('إيطال') || s.includes('ايطال') || s.includes('italian')) return '🇮🇹';
  if (s.includes('تاريخ') || s.includes('history')) return '🏛️';
  if (s.includes('جغراف') || s.includes('geography')) return '🌍';
  if (s.includes('فلسف') || s.includes('منطق') || s.includes('philosophy')) return '🧠';
  if (s.includes('علم نفس') || s.includes('اجتماع') || s.includes('psychology')) return '👥';
  if (s.includes('حاسب') || s.includes('تكنولوج') || s.includes('برمج') || s.includes('computer')) return '💻';
  if (s.includes('دين') || s.includes('إسلام') || s.includes('تربية دينية')) return '🕌';
  if (s.includes('احصاء') || s.includes('إحصاء') || s.includes('statistics')) return '📊';
  return '📚';
}

@Injectable({ providedIn: 'root' })
export class TeacherDirectoryService extends ApiBaseService {
  private readonly _subjectOptions = signal<SubjectFilterOption[]>([
    { id: 'all', labelKey: 'STUDENT.TEACHERS.FILTER_ALL', defaultLabel: 'كل المواد' },
  ]);

  readonly subjectOptions = this._subjectOptions.asReadonly();

  private readonly _loading = signal<boolean>(false);
  private readonly _teachers = signal<TeacherDirectoryItem[]>([]);

  readonly loading = this._loading.asReadonly();
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<TeacherSubjectCategory>('all');

  readonly filteredTeachers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory().trim().toLowerCase();

    return this._teachers().filter((teacher) => {
      const matchesCategory =
        category === 'all' ||
        teacher.subjectName.trim().toLowerCase() === category ||
        teacher.subjectCategory.trim().toLowerCase() === category;
      const matchesQuery =
        !query ||
        teacher.name.toLowerCase().includes(query) ||
        teacher.subjectName.toLowerCase().includes(query) ||
        teacher.bio.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  });

  loadTeachers(): void {
    this._loading.set(true);

    this.get<TeacherProfile[]>('/teachers')
      .pipe(
        map((teachersList) => {
          if (!teachersList || teachersList.length === 0) {
            return [];
          }

          // Build dynamic subject filters from real database teachers
          const uniqueSubjects = Array.from(
            new Set(
              teachersList
                .map((t) => t.specialization && t.specialization.trim())
                .filter((s): s is string => Boolean(s && s.length > 0)),
            ),
          );

          const dynamicOptions: SubjectFilterOption[] = [
            { id: 'all', labelKey: 'STUDENT.TEACHERS.FILTER_ALL', defaultLabel: 'كل المواد' },
          ];

          uniqueSubjects.forEach((subj) => {
            dynamicOptions.push({
              id: subj,
              defaultLabel: subj,
              emoji: getSubjectEmoji(subj),
            });
          });

          this._subjectOptions.set(dynamicOptions);

          return teachersList.map((t, idx) => {
            const realSubject = (t.specialization && t.specialization.trim()) || 'التعليم العام';
            const cat = inferCategory(realSubject);
            const styleIdx = idx % CARD_GRADIENTS.length;

            const bio =
              (t.description && t.description.trim()) ||
              (realSubject !== 'التعليم العام'
                ? `معلم مادة ${realSubject} على منصة دراية.`
                : 'معلم معتمد في منصة دراية التعليمية.');

            return {
              id: t.userId,
              name: t.fullName ? `أ. ${t.fullName}` : 'معلم معتمد',
              subjectCategory: cat,
              subjectName: realSubject,
              rating: 5.0,
              avatarUrl:
                t.pictureUrl && t.pictureUrl.trim().length > 0
                  ? t.pictureUrl
                  : 'assets/images/default-teacher-avatar.svg',
              isVerified: true,
              bio: bio,
              packagesCount: 1,
              studentsCount: 0,
              cardGradient: CARD_GRADIENTS[styleIdx],
              blurBlobColor: BLUR_COLORS[styleIdx],
              badgeBgColor: BADGE_STYLES[styleIdx].bg,
              badgeBorderColor: BADGE_STYLES[styleIdx].border,
              badgeTextColor: BADGE_STYLES[styleIdx].text,
            };
          });
        }),
        catchError(() => {
          return of([]);
        }),
      )
      .subscribe({
        next: (items) => {
          this._teachers.set(items);
          this._loading.set(false);
        },
        error: () => {
          this._teachers.set([]);
          this._loading.set(false);
        },
      });
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setSelectedCategory(category: TeacherSubjectCategory): void {
    this.selectedCategory.set(category);
  }
}
