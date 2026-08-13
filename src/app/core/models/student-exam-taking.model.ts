// src/app/core/models/student-exam-taking.model.ts

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
  readonly correctOptionId: string;
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
}

export interface ExamResultReport {
  readonly examId: string;
  readonly examTitle: string;
  readonly scorePercentage: number;
  readonly gradeLabel: string;
  readonly isPassed: boolean;
  readonly submittedAt: string;
  readonly weaknessTopics: readonly ExamWeaknessTopic[];
  readonly reviewQuestions: readonly ExamReviewItem[];
}
