// src/app/core/models/teacher.model.ts

export interface TeacherProfile {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  specialization: string;
  description: string;
  pictureUrl?: string;
}

export type TeacherSubjectCategory = 'all' | 'math' | 'physics' | 'chemistry' | 'biology';

export interface SubjectFilterOption {
  readonly id: TeacherSubjectCategory;
  readonly labelKey: string;
  readonly defaultLabel: string;
  readonly emoji?: string;
}

export interface TeacherDirectoryItem {
  readonly id: string;
  readonly name: string;
  readonly subjectCategory: TeacherSubjectCategory;
  readonly subjectName: string;
  readonly rating: number;
  readonly avatarUrl: string;
  readonly isVerified: boolean;
  readonly bio: string;
  readonly packagesCount: number;
  readonly studentsCount: number;
  readonly cardGradient: string;
  readonly blurBlobColor: string;
  readonly badgeBgColor: string;
  readonly badgeBorderColor: string;
  readonly badgeTextColor: string;
}
