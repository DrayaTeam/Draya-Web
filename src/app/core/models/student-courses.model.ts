// src/app/core/models/student-courses.model.ts

export interface SubscribedPackage {
  readonly id: string;
  readonly title: string;
  readonly teacherName: string;
  readonly subjectName: string;
  readonly statusText: string;
  readonly isActive: boolean;
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly progressPercent: number;
  readonly studyGroupName: string;
  readonly bannerImageUrl: string;
  readonly progressGradient: string;
}

export interface StudentCoursesHeaderInfo {
  readonly badgeText: string;
  readonly mainHeading: string;
  readonly subtitleText: string;
}
