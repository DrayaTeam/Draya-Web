import { DifficultyLevel, QuestionType } from './exam-generation.model';

export interface ExamQuestionOptionDto {
  text: string;
  isCorrect: boolean;
}

export interface ExamQuestionDto {
  id: string;
  type: QuestionType;
  text: string;
  options?: ExamQuestionOptionDto[];
  correctAnswer?: string;
  explanation?: string;
  rubric?: string;
  difficultyLevel?: string;
  order: number;
}

export interface TeacherExamDto {
  durationMinutes: number;
  startDate: string;
  endDate?: string;
  allowedAttempts: number;
  id: string;
  classroomId?: string;
  sectionId?: string;
  topic: string;
  difficultyLevel: string;
  status: string;
  totalQuestions: number;
  createdAt: string;
  questions?: ExamQuestionDto[];
}

export interface UpdateQuestionRequest {
  text: string;
  type?: string;
  difficulty?: string;
  rubric?: string;
  options?: { text: string; isCorrect: boolean }[];
}

export interface RefineQuestionRequest {
  instruction: string;
}
