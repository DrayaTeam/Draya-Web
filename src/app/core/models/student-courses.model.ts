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

export interface ClassroomFeedbackItemDto {
  feedbackId: string;
  studentName?: string;
  studentAvatarUrl?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface ClassroomFeedbackSummaryDto {
  averageRating: number;
  totalCount: number;
  items?: ClassroomFeedbackItemDto[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SubmitClassroomFeedbackRequest {
  rating: number;
  comment?: string;
}

export interface ClassroomSectionDto {
  id?: string;
  sectionId?: string;
  title: string;
  description?: string;
  order?: number;
  materials?: unknown[];
}
