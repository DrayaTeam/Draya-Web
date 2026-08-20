// src/app/core/models/student-roster.model.ts
import { PaginatedResponse } from './classroom.model';

export interface StudentRosterItemDto {
  studentId: string;
  fullName: string;
  profilePictureUrl?: string | null;
  pictureUrl?: string | null;
  enrolledAt: string;
  status: string;
}

export type StudentRosterItemDtoPagedResult = PaginatedResponse<StudentRosterItemDto>;
