// src/app/core/services/student-exams.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { StudentExamItem, StudentExamsHeaderInfo, ExamStatusType } from '../models/student-exam.model';

@Injectable({ providedIn: 'root' })
export class StudentExamsService {
  readonly headerInfo = signal<StudentExamsHeaderInfo>({
    badgeText: 'مركز التقويم والاختبارات التفاعلية',
    mainHeading: 'الامتحانات والواجبات المجدولة',
    subtitleText:
      'استعرض الامتحانات والواجبات المحددة لك من قبل معلميك مع متابعة درجات التصحيح الفوري.',
  });

  readonly selectedFilter = signal<'all' | ExamStatusType>('all');

  readonly exams = signal<StudentExamItem[]>([
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
      statusLabel: 'مجدول لاحقاً',
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
  ]);

  readonly filteredExams = computed(() => {
    const filter = this.selectedFilter();
    if (filter === 'all') return this.exams();
    return this.exams().filter((ex) => ex.status === filter);
  });
}
