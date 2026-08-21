// src/app/features/teacher/dashboard/components/teacher-daily-courses/teacher-daily-courses.component.ts
import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { PHOTOS } from '../../../../../core/constants/photos';

interface CourseItem {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  completedLectures: number;
  totalLectures: number;
  progressPercent: number;
  gradientClass: string;
  imgUrl: string;
}

@Component({
  selector: 'draya-teacher-daily-courses',
  standalone: true,
  imports: [],
  templateUrl: './teacher-daily-courses.component.html',
  styleUrl: './teacher-daily-courses.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class TeacherDailyCoursesComponent {
  readonly resumeCourse = output<string>();
  readonly defaultThumbnail = 'assets/images/default-classroom.svg';

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && !target.src.includes('default-classroom.svg')) {
      target.src = this.defaultThumbnail;
    }
  }

  readonly courses: CourseItem[] = [
    {
      id: 'c1',
      title: 'الجبر وحساب المثلثات',
      subject: 'الرياضيات',
      teacher: 'أ. محمد علي',
      completedLectures: 12,
      totalLectures: 18,
      progressPercent: 68,
      gradientClass: 'blue-purple-gradient',
      imgUrl: PHOTOS.teacherClass,
    },
    {
      id: 'c2',
      title: 'الفيزياء الكهربية والحديثة',
      subject: 'الفيزياء',
      teacher: 'أ. سارة حسن',
      completedLectures: 8,
      totalLectures: 20,
      progressPercent: 40,
      gradientClass: 'purple-pink-gradient',
      imgUrl: PHOTOS.studentStudy,
    },
    {
      id: 'c3',
      title: 'الكيمياء العضوية المتقدمة',
      subject: 'الكيمياء',
      teacher: 'أ. أحمد سامي',
      completedLectures: 17,
      totalLectures: 20,
      progressPercent: 85,
      gradientClass: 'teal-emerald-gradient',
      imgUrl: PHOTOS.studyGroup,
    },
  ];
}
