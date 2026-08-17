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

export interface ClassroomDto {
  classroomId: string;
  teacherId: string;
  subjectName?: string;
  name?: string;
  enrollmentCode?: string;
  isActive: boolean;
  studentCount: number;
  createdAt: string;
  classroomTypeName?: string;
  gradeLevelName?: string;
  startDate?: string;
  endDate?: string;
  price?: number;
}

export interface ClassroomDtoPagedResult {
  items?: ClassroomDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
