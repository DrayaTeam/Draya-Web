// src/app/core/services/teacher-directory.service.ts
import { Injectable, signal, computed } from '@angular/core';
import {
  TeacherDirectoryItem,
  TeacherSubjectCategory,
  SubjectFilterOption,
} from '../models/teacher.model';

@Injectable({ providedIn: 'root' })
export class TeacherDirectoryService {
  // Available filter options
  readonly subjectOptions: readonly SubjectFilterOption[] = [
    { id: 'all', labelKey: 'STUDENT.TEACHERS.FILTER_ALL', defaultLabel: 'كل المواد' },
    { id: 'math', labelKey: 'STUDENT.TEACHERS.FILTER_MATH', defaultLabel: 'الرياضيات', emoji: '📐' },
    { id: 'physics', labelKey: 'STUDENT.TEACHERS.FILTER_PHYSICS', defaultLabel: 'الفيزياء', emoji: '⚡' },
    { id: 'chemistry', labelKey: 'STUDENT.TEACHERS.FILTER_CHEMISTRY', defaultLabel: 'الكيمياء', emoji: '🧪' },
    { id: 'biology', labelKey: 'STUDENT.TEACHERS.FILTER_BIOLOGY', defaultLabel: 'الأحياء', emoji: '🧬' },
  ];

  // Initial mock dataset from Figma specifications
  private readonly _teachers = signal<TeacherDirectoryItem[]>([
    {
      id: 'tch-1',
      name: 'أ. أحمد السيد',
      subjectCategory: 'math',
      subjectName: 'الرياضيات',
      rating: 4.9,
      avatarUrl:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300&auto=format&fit=crop',
      isVerified: true,
      bio: 'خبرة أكثر من 15 عاماً في تدريس الجبر والتفاضل للمرحلة الثانوية بمدارس القاهرة ومقدم مراجعات نهائية شهيرة.',
      packagesCount: 3,
      studentsCount: 1240,
      cardGradient:
        'linear-gradient(135deg, rgba(0, 166, 244, 0.1) 0%, rgba(97, 95, 255, 0.05) 100%), #FFFFFF',
      blurBlobColor: '#0EA5E9',
      badgeBgColor: '#DFF2FE',
      badgeBorderColor: '#B8E6FE',
      badgeTextColor: '#00598A',
    },
    {
      id: 'tch-2',
      name: 'أ. سارة محمد',
      subjectCategory: 'physics',
      subjectName: 'الفيزياء',
      rating: 4.8,
      avatarUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop',
      isVerified: true,
      bio: 'مدرسة الفيزياء الحديثة والميكانيكا بطرق تفاعلية وشرح مبسط مع ملخصات التجارب العملية والأسئلة الوزارية.',
      packagesCount: 2,
      studentsCount: 850,
      cardGradient:
        'linear-gradient(135deg, rgba(173, 70, 255, 0.1) 0%, rgba(246, 51, 154, 0.05) 100%), #FFFFFF',
      blurBlobColor: '#8B5CF6',
      badgeBgColor: '#F3E8FF',
      badgeBorderColor: '#E9D4FF',
      badgeTextColor: '#6E11B0',
    },
    {
      id: 'tch-3',
      name: 'أ. محمود عبد الله',
      subjectCategory: 'chemistry',
      subjectName: 'الكيمياء',
      rating: 4.7,
      avatarUrl:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop',
      isVerified: true,
      bio: 'شرح الكيمياء العضوية والغير عضوية من خلال خرائط ذهنية مبتكرة وتقنيات تذكر التفاعلات المعقدة.',
      packagesCount: 1,
      studentsCount: 920,
      cardGradient:
        'linear-gradient(135deg, rgba(0, 188, 125, 0.1) 0%, rgba(0, 187, 167, 0.05) 100%), #FFFFFF',
      blurBlobColor: '#10B981',
      badgeBgColor: '#D0FAE5',
      badgeBorderColor: '#A4F4CF',
      badgeTextColor: '#006045',
    },
    {
      id: 'tch-4',
      name: 'أ. نورهان الشريف',
      subjectCategory: 'biology',
      subjectName: 'الأحياء',
      rating: 4.9,
      avatarUrl:
        'https://images.unsplash.com/photo-1580894732413-b7ce75e785f3?q=80&w=300&auto=format&fit=crop',
      isVerified: true,
      bio: 'متخصصة علم الأحياء الدقيقة والوراثة، شرح تفاعلي ثلاثي الأبعاد مع متابعة دورية لكل طالب.',
      packagesCount: 2,
      studentsCount: 1100,
      cardGradient:
        'linear-gradient(135deg, rgba(255, 32, 86, 0.1) 0%, rgba(254, 154, 0, 0.05) 100%), #FFFFFF',
      blurBlobColor: '#F43F5E',
      badgeBgColor: '#FFE4E6',
      badgeBorderColor: '#FFCCD3',
      badgeTextColor: '#A50036',
    },
  ]);

  // Reactive state signals
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<TeacherSubjectCategory>('all');

  // Filtered teachers list computed signal
  readonly filteredTeachers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const category = this.selectedCategory();

    return this._teachers().filter((teacher) => {
      const matchesCategory = category === 'all' || teacher.subjectCategory === category;
      const matchesQuery =
        !query ||
        teacher.name.toLowerCase().includes(query) ||
        teacher.subjectName.toLowerCase().includes(query) ||
        teacher.bio.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  });

  // State mutators
  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setSelectedCategory(category: TeacherSubjectCategory): void {
    this.selectedCategory.set(category);
  }
}
