// src/app/core/models/student-exam-taking.model.ts

export interface StartAttemptRequestDto {
  examId: string;
}

export interface AnswerSubmissionDto {
  examQuestionId: string;
  selectedOptionId?: string;
  answerText?: string;
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
  rationale?: string | null;
  teacherOverrideScore?: number | null;
}

export interface AttemptAnswerResultDto {
  answerId: string;
  examQuestionId: string;
  answerText?: string;
  selectedOptionId?: string | null;
  gradingResult?: AnswerGradingResultDto;
}

export interface AttemptResultResponseDto {
  attemptId: string;
  examId: string;
  isSubmitted: boolean;
  submittedAt: string;
  finalScore: number;
  needsTeacherReview: boolean;
  answers: AttemptAnswerResultDto[];
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
  options?: StudentExamQuestionOptionDto[];
}

export interface StudentExamDto {
  id: string;
  classroomId?: string;
  sectionId?: string;
  title?: string;
  topic?: string;
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
  readonly options: readonly ExamQuestionOption[];
  readonly selectedOptionId?: string;
  readonly correctOptionId?: string;
  readonly isFlagged?: boolean;
}

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
}
