// src/app/core/models/student-exam-taking.model.ts

export interface StartAttemptRequestDto {
  examId: string;
}

export interface AnswerSubmissionDto {
  examQuestionId: string;
  selectedOptionId?: string | null;
  answerText?: string | null;
}

export interface SubmitAttemptRequestDto {
  answers?: AnswerSubmissionDto[];
  idempotencyKey?: string;
}

export interface SubmitAttemptResponseDto {
  gradingJobId: string;
  message?: string;
}

export interface GradingJobStatusDto {
  id: string;
  studentExamAttemptId?: string;
  status: 'Pending' | 'Grading' | 'Completed' | 'CompletedWithWarning' | 'Failed';
  createdAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface AnswerGradingResultDto {
  score: number;
  maxScore: number;
  confidenceScore?: number | null;
  isAiGraded: boolean;
  needsTeacherReview: boolean;
  /** true once the score is locked in (deterministic questions finalize automatically). Confirmed nested here (GradingResultDto), not on the answer itself, via swagger 2026-08-24. */
  isFinalized?: boolean;
  reviewedByTeacherId?: string | null;
  rationale?: string | null;
  teacherOverrideScore?: number | null;
}

export interface AttemptAnswerResultDto {
  answerId: string;
  examQuestionId: string;
  answerText?: string;
  selectedOptionId?: string | null;
  gradingResult?: AnswerGradingResultDto;
  correctOptionId?: string | null;
  correctAnswerText?: string | null;
  // Enriched by the backend so the review screen doesn't need a second exam fetch.
  questionText?: string;
  questionType?: string;
  rubric?: string | null;
}

export interface AttemptResultResponseDto {
  attemptId: string;
  examId: string;
  isSubmitted: boolean;
  submittedAt: string;
  finalScore: number;
  needsTeacherReview: boolean;
  answers: AttemptAnswerResultDto[];
  examTitle?: string;
  maxScore?: number;
}

export interface StudentExamQuestionOptionDto {
  id: string;
  text?: string;
}

export interface StudentExamQuestionDto {
  id: string;
  text?: string;
  type?: string;
  difficulty?: string;
  /** Present in swagger but should not drive grading client-side — the student payload never carries an answer key. */
  rubric?: string;
  options?: StudentExamQuestionOptionDto[];
}

export interface StudentExamDto {
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
  createdAt?: string;
  questions?: StudentExamQuestionDto[];
}

export interface StartAttemptResponseDto {
  attemptId?: string;
  id?: string;
  examId?: string;
  examTitle?: string;
  title?: string;
  durationMinutes?: number;
  startDate?: string;
  endDate?: string | null;
  allowedAttempts?: number;
  startedAt?: string;
  expiresAt?: string;
  questions?: StudentExamQuestionDto[];
}

export interface ExamQuestionOption {
  readonly id: string;
  readonly text: string;
}

export interface ExamQuestion {
  readonly id: string;
  readonly index: number;
  readonly text: string;
  readonly subjectTag: string;
  readonly type?: string;
  readonly options: readonly ExamQuestionOption[];
  readonly selectedOptionId?: string;
  readonly answerText?: string;
  readonly isFlagged?: boolean;
}

/** Distinguishable failure reasons for POST /attempts/start, since the backend reports them via status code + message text rather than a typed error code. */
export type StartAttemptFailureReason =
  'no-attempts-remaining' | 'exam-expired' | 'attempt-in-progress' | 'unknown';

export interface ExamWeaknessTopic {
  readonly id: string;
  readonly title: string;
  readonly accuracyPercentage: number;
  readonly aiTip: string;
  readonly reviewLectureUrl: string;
}

export interface ExamReviewItem {
  readonly questionIndex: number;
  readonly questionText: string;
  readonly isCorrect: boolean;
  readonly studentAnswerText: string;
  readonly correctAnswerText: string;
  readonly explanation?: string;
  readonly earnedScore?: number;
  readonly maxScore?: number;
  readonly isAiGraded?: boolean;
  readonly needsTeacherReview?: boolean;
  readonly isPendingGrading?: boolean;
}

export interface ExamResultReport {
  readonly attemptId?: string;
  readonly examId: string;
  readonly examTitle: string;
  readonly scorePercentage: number;
  readonly studentScore?: number;
  readonly totalScore?: number;
  readonly gradeLabel: string;
  readonly isPassed: boolean;
  readonly submittedAt: string;
  readonly weaknessTopics: readonly ExamWeaknessTopic[];
  readonly reviewQuestions: readonly ExamReviewItem[];
  readonly isGradingPending?: boolean;
  readonly isGradingFailed?: boolean;
  readonly gradingStatusMessage?: string;
}
