// src/app/core/models/classroom.model.ts

export interface SubjectDto {
  id: string;
  name: string;
}

export interface ClassroomTypeDto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface GradeLevelDto {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ClassroomDto {
  classroomId: string;
  teacherId: string;
  subjectName: string;
  name: string;
  enrollmentCode: string;
  isActive: boolean;
  studentCount: number;
  createdAt: string;
  classroomTypeName: string;
  gradeLevelName: string;
  startDate: string;
  endDate: string;
  price: number;
}

export interface CreateClassroomRequest {
  subjectId: string;
  name: string;
  classroomTypeId: string;
  gradeLevelId: string;
  startDate: string; // Must be ISO string
  endDate: string;   // Must be ISO string
  price: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ClassroomDtoPagedResult extends PaginatedResponse<ClassroomDto> {}

