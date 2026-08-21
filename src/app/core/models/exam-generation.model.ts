export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type QuestionType =
  'MCQ' | 'MultipleChoice' | 'Essay' | 'TrueFalse' | 'FillInTheBlank' | 'ShortAnswer';

export enum GenerationStatus {
  Pending = 0,
  Retrieving = 1,
  Generating = 2,
  Validating = 3,
  Completed = 4,
  CompletedWithWarning = 5,
  DataUnavailable = 6, // Insufficient Context
  Failed = 7, // AI Service Error
}

export interface QuestionRequirement {
  type: QuestionType;
  count: number;
}

export interface GenerateExamRequest {
  durationMinutes: number;
  startDate: string;
  endDate?: string;
  allowedAttempts: number;
  classroomId: string;
  sectionId: string;
  topic: string;
  difficultyLevel: DifficultyLevel;
  questionRequirements: QuestionRequirement[];
  teacherInstructions?: string;
  idempotencyKey: string;
  teacherId: string;
  isPracticeReview: boolean;
}

export interface GenerateExamResponse {
  generationId: string;
}
