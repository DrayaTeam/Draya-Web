export interface Classroom {
  classroomId: string;
  teacherId: string;
  subjectName: string;
  name: string;
  enrollmentCode: string;
  isActive: boolean;
  studentCount: number;
  createdAt: string;
  price?: number;
  currency?: string;
  isFree?: boolean;
}

export interface CreateClassroomRequest {
  subjectId: string;
  name: string;
}

export interface PaginatedResponse<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}
