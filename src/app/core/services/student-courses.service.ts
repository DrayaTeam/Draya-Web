// src/app/core/services/student-courses.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { SubscribedPackage, StudentCoursesHeaderInfo } from '../models/student-courses.model';

@Injectable({ providedIn: 'root' })
export class StudentCoursesService {
  readonly headerInfo = signal<StudentCoursesHeaderInfo>({
    badgeText: 'محتواك المفضل وتحديات التعلم',
    mainHeading: 'باقاتي الدراسية النشطة',
    subtitleText:
      'استعرض باقاتك الأكاديمية النشطة، وتابع المحاضرات والامتحانات المرفقة لكل مادة بحماس.',
  });

  readonly searchQuery = signal<string>('');

  readonly subscribedPackages = signal<SubscribedPackage[]>([
    {
      id: 'pkg-1',
      title: 'باقة الجبر وحساب المثلثات للشهادة الثانوية',
      teacherName: 'أ. أحمد السيد',
      subjectName: 'الرياضيات',
      statusText: 'سارية ومفعّلة',
      isActive: true,
      completedLessons: 12,
      totalLessons: 18,
      progressPercent: 68,
      studyGroupName: 'مجموعة أ - علمي رياضة',
      bannerImageUrl:
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
      progressGradient: 'linear-gradient(90deg, #00A6F4 0%, #4F39F6 100%)',
    },
    {
      id: 'pkg-2',
      title: 'باقة الكيمياء العضوية المتقدمة والمراجعة النهائية',
      teacherName: 'أ. أحمد سامي',
      subjectName: 'الكيمياء',
      statusText: 'سارية ومفعّلة',
      isActive: true,
      completedLessons: 17,
      totalLessons: 20,
      progressPercent: 85,
      studyGroupName: 'مجموعة ج - مراجعة عامة',
      bannerImageUrl:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
      progressGradient: 'linear-gradient(90deg, #00BC7D 0%, #009689 100%)',
    },
  ]);

  readonly filteredPackages = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return this.subscribedPackages();
    return this.subscribedPackages().filter(
      (pkg) =>
        pkg.title.toLowerCase().includes(query) ||
        pkg.teacherName.toLowerCase().includes(query) ||
        pkg.subjectName.toLowerCase().includes(query),
    );
  });
}
