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
            items.map((c, idx) => {
              const progressObj =
                typeof c.studentProgress === 'object' && c.studentProgress !== null
                  ? c.studentProgress
                  : null;
              const progressPercent =
                typeof c.studentProgress === 'number'
                  ? c.studentProgress
                  : (progressObj?.progressPercent ?? 0);
              const totalLessons = progressObj?.totalLessons ?? c.materialsCount ?? 10;
              const completedLessons =
                progressObj?.completedLessons ?? Math.round((progressPercent / 100) * totalLessons);

              return {
                id: c.classroomId,
                title: c.name || 'فصل دراسي',
                teacherName:
                  c.teacherName || (c.subjectName ? `أستاذ ${c.subjectName}` : 'معلم المادة'),
                subjectName: c.subjectName || 'المادة الدراسية',
                statusText: c.isActive ? 'سارية ومفعّلة' : 'غير نشطة',
                isActive: c.isActive,
                completedLessons: isNaN(completedLessons) ? 0 : completedLessons,
                totalLessons: isNaN(totalLessons) || totalLessons === 0 ? 1 : totalLessons,
                progressPercent: isNaN(progressPercent) ? 0 : progressPercent,
                studyGroupName: c.classroomTypeName
                  ? `${c.classroomTypeName} - ${c.gradeLevelName || ''}`
                  : 'مجموعة دراسية',
                bannerImageUrl: c.imageUrl || 'assets/images/default-classroom.svg',
                progressGradient: COURSE_GRADIENTS[idx % COURSE_GRADIENTS.length],
              };
            }),
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
