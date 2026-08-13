// src/app/core/models/student-exam.model.ts

export type ExamStatusType = 'available' | 'scheduled' | 'completed';

export interface StudentExamItem {
  readonly id: string;
  readonly title: string;
  readonly teacherName: string;
  readonly subjectName: string;
  readonly status: ExamStatusType;
  readonly statusLabel: string;
  readonly durationMinutes: number;
  readonly secondaryDetailText: string;
  readonly scorePercent?: number;
  readonly cornerTintBg: string;
}

export interface StudentExamsHeaderInfo {
  readonly badgeText: string;
  readonly mainHeading: string;
  readonly subtitleText: string;
}
