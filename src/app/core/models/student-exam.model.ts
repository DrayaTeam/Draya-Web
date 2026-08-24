// src/app/core/models/student-exam.model.ts

export type ExamStatusType =
  'available' | 'scheduled' | 'in-progress' | 'pending-grading' | 'completed' | 'expired';

/** One historical attempt on an exam, as embedded in GET /students/exams. */
export interface StudentExamAttemptSummaryDto {
  id: string;
  finalScore?: number | null;
  needsTeacherReview?: boolean;
  submittedAt?: string | null;
  startedAt?: string;
}

/** Canonical shape of GET /api/v1/students/exams (and the per-item entries of its paged result). */
export interface StudentExamSummaryDto {
  id: string;
  classroomId?: string;
  sectionId?: string;
  title?: string;
  topic?: string;
  durationMinutes?: number;
  startDate?: string;
  endDate?: string | null;
  allowedAttempts?: number;
  questionsCount?: number;
  totalQuestions?: number;
  maxScore?: number;
  createdAt?: string;
  hasSubmitted?: boolean;
  attemptStatus?: 'NotStarted' | 'InProgress' | 'PendingGrading' | 'Completed' | string;
  latestScore?: number | null;
  usedAttempts?: number;
  attempts?: StudentExamAttemptSummaryDto[];
  // Fields the backend does not (yet) return on this endpoint, kept optional so the
  // client degrades gracefully if/when they are added.
  teacherName?: string;
  subjectName?: string;
}

export interface StudentExamItem {
  readonly id: string;
  readonly title: string;
  readonly teacherName?: string;
  readonly subjectName: string;
  readonly status: ExamStatusType;
  readonly statusLabel: string;
  readonly durationMinutes: number;
  readonly secondaryDetailText: string;
  readonly scorePercent?: number | null;
  readonly cornerTintBg: string;
  readonly allowedAttempts?: number;
  readonly attemptsTaken?: number;
  /** Needed to deep-link straight to a specific attempt's result / resume it. */
  readonly latestAttemptId?: string;
  readonly needsTeacherReview?: boolean;
}

export interface StudentExamsHeaderInfo {
  readonly badgeText: string;
  readonly mainHeading: string;
  readonly subtitleText: string;
}
