// src/app/core/models/teacher-attempt-review.model.ts

// ── GET /api/v1/teachers/pending-reviews (typed in swagger) ────────────────
export interface PendingReviewAttemptDto {
  attemptId: string;
  studentId: string;
  studentName?: string;
  submittedAt?: string;
  score?: number | null;
}

export interface PendingReviewExamDto {
  examId: string;
  examTitle?: string;
  pendingReviews?: PendingReviewAttemptDto[];
}

export interface PendingReviewClassroomDto {
  classroomId: string;
  classroomName?: string;
  exams?: PendingReviewExamDto[];
}

// ── PUT /api/v1/attempts/{attemptId}/answers/{answerId}/override ──────────
export interface OverrideScoreRequestDto {
  newScore: number;
}
