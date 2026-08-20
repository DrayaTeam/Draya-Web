// src/app/core/services/student-courses.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  SubscribedPackage,
  StudentCoursesHeaderInfo,
  ClassroomDtoPagedResult,
} from '../models/student-courses.model';

const COURSE_GRADIENTS = [
  'linear-gradient(90deg, #00A6F4 0%, #4F39F6 100%)',
  'linear-gradient(90deg, #00BC7D 0%, #009689 100%)',
  'linear-gradient(90deg, #AD46FF 0%, #E60076 100%)',
  'linear-gradient(90deg, #FF6B35 0%, #F7C59F 100%)',
];

const COURSE_BANNERS = [
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=800&auto=format&fit=crop',
];

@Injectable({ providedIn: 'root' })
export class StudentCoursesService extends ApiBaseService {
  readonly headerInfo = signal<StudentCoursesHeaderInfo>({
    badgeText: 'محتواك المفضل وتحديات التعلم',
    mainHeading: 'فصولي الدراسية النشطة',
    subtitleText:
      'استعرض فصولك الأكاديمية النشطة، وتابع المحاضرات والامتحانات المرفقة لكل مادة بحماس.',
  });

  private readonly _loading = signal<boolean>(false);
  private readonly _subscribedPackages = signal<SubscribedPackage[]>([]);

  readonly loading = this._loading.asReadonly();
  readonly searchQuery = signal<string>('');
  readonly subscribedPackages = this._subscribedPackages.asReadonly();

  readonly filteredPackages = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const list = this.subscribedPackages();
    if (!query) return list;
    return list.filter(
      (pkg) =>
        pkg.title.toLowerCase().includes(query) ||
        pkg.teacherName.toLowerCase().includes(query) ||
        pkg.subjectName.toLowerCase().includes(query),
    );
  });

  loadCourses(): void {
    this._loading.set(true);
    this.get<ClassroomDtoPagedResult>('/classrooms')
      .pipe(
        tap((res) => {
          const items = res?.items || [];
          this._subscribedPackages.set(
            items.map((c, idx) => ({
              id: c.classroomId,
              title: c.name || 'فصل دراسي',
              teacherName:
                c.teacherName || (c.gradeLevelName ? `أستاذ ${c.subjectName || ''}` : 'معلم دراية'),
              subjectName: c.subjectName || 'المادة الدراسية',
              statusText: c.isActive ? 'سارية ومفعّلة' : 'غير نشطة',
              isActive: c.isActive,
              completedLessons: Math.round(
                ((c.studentProgress ?? 0) / 100) * (c.materialsCount ?? 10),
              ),
              totalLessons: c.materialsCount ?? 10,
              progressPercent: c.studentProgress ?? 0,
              studyGroupName: c.classroomTypeName
                ? `${c.classroomTypeName} - ${c.gradeLevelName || ''}`
                : 'مجموعة دراسية',
              bannerImageUrl: COURSE_BANNERS[idx % COURSE_BANNERS.length],
              progressGradient: COURSE_GRADIENTS[idx % COURSE_GRADIENTS.length],
            })),
          );
          this._loading.set(false);
        }),
        catchError(() => {
          this._subscribedPackages.set([]);
          this._loading.set(false);
          return of(null);
        }),
      )
      .subscribe({
        next: () => void 0,
        error: () => void 0,
      });
  }
}
