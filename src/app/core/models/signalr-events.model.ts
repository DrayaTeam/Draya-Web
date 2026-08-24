// src/app/core/models/signalr-events.model.ts
// Purpose: Typed payloads for every server-to-client SignalR event used in Draya.
// Keep in sync with: API docs/notifications details and new endpoint.md

/** Emitted when a material's parsing job finishes or fails. (Hub E: /hubs/materials) */
export interface MaterialParsedEvent {
  readonly materialId: string;
  /** Renamed from materialVersionId to match backend spec */
  readonly versionId: string;
  readonly status: 'Success' | 'Failed';
  readonly message: string;
}

/** Emitted when an AI exam-generation job completes (legacy, /hubs/notifications). */
export interface ExamGenerationCompletedEvent {
  readonly jobId: string;
  readonly examId: string | null;
  readonly status: 'Completed' | 'Failed';
  readonly generatedCount: number;
  readonly insufficientContentWarning: boolean;
}

/** Emitted when AI grading of a student attempt finishes (legacy, /hubs/notifications). */
export interface GradingCompletedEvent {
  readonly attemptId?: string;
  readonly studentExamAttemptId?: string;
  readonly examId?: string;
  readonly jobId?: string;
  readonly status?: 'Completed' | 'Failed' | string;
  readonly gradingStatus?: 'Completed' | 'Failed' | string;
  readonly totalScore?: number;
  readonly maxScore?: number;
}

/** Emitted during AI exam generation progress. (Hub A: /hubs/exam-generation) */
export interface GenerationProgressEvent {
  readonly generationId?: string;
  readonly status:
    | 'Pending'
    | 'Retrieving'
    | 'Generating'
    | 'Validating'
    | 'Completed'
    | 'CompletedWithWarning'
    | 'DataUnavailable'
    | 'Failed'
    | 'InProgress'
    | string;
  readonly examId?: string | null;
  readonly errorMessage?: string | null;
  readonly progress?: number;
  readonly message?: string;
  readonly error?: string;
}

/** Emitted when a new chat message is posted in a classroom (legacy, /hubs/notifications). */
export interface NewChatMessageEvent {
  readonly classroomId: string;
  readonly messageId: string;
  readonly senderName: string;
  readonly messageText: string;
  readonly sentAt: string; // ISO 8601
  readonly isAnnouncement: boolean;
}

/** Emitted when AI grading of open-ended questions progresses. (Hub B: /hubs/exam-grading) */
export interface GradingProgressEvent {
  readonly gradingJobId: string;
  readonly status: 'Pending' | 'Grading' | 'Completed' | 'Failed';
  readonly errorMessage: string | null;
  readonly finalScore: number | null;
  readonly needsTeacherReview: boolean;
}

/** Emitted on Q&A room events (QuestionCreated/Replied/VoteUpdated). (Hub C: /hubs/qa) */
export interface QaEvent {
  readonly classroomId: string;
  readonly questionId: string;
}

/** Emitted when an AI performance report finishes generating. (Hub D: /hubs/reports) */
export interface ReportGeneratedEvent {
  readonly reportId: string;
  readonly studentId: string;
}

/** Emitted when the system detects a student is falling behind. (Hub D: /hubs/reports) */
export interface StudentAtRiskEvent {
  readonly studentId: string;
  readonly topicName: string;
}

/**
 * Emitted when a teacher overrides an individual answer's score after grading
 * (legacy, /hubs/notifications). `newScore` is a raw point value for that one
 * answer, not the recalculated attempt-level percentage — the client always
 * refetches attempt results rather than trying to patch the total from this.
 */
export interface AnswerScoreOverriddenEvent {
  readonly attemptId: string;
  readonly answerId: string;
  readonly newScore: number;
}
