// src/app/core/models/signalr-events.model.ts
// Purpose: Typed payloads for every server-to-client SignalR event used in Draya.
// Keep in sync with CONTEXT.md §Real-Time Events (SignalR).

/** Emitted when a material's parsing job finishes or fails. */
export interface MaterialParsedEvent {
  readonly materialId: string;
  readonly materialVersionId: string;
  readonly parseStatus: 'Parsed' | 'Failed';
  readonly title: string;
}

/** Emitted when an AI exam-generation job completes. */
export interface ExamGenerationCompletedEvent {
  readonly jobId: string;
  readonly examId: string | null;
  readonly status: 'Completed' | 'Failed';
  readonly generatedCount: number;
  readonly insufficientContentWarning: boolean;
}

/** Emitted when AI grading of a student attempt finishes. */
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

/** Emitted during AI practice/exam generation progress from /hubs/exam-generation. */
export interface GenerationProgressEvent {
  readonly generationId?: string;
  readonly status:
    'InProgress' | 'Validating' | 'Completed' | 'DataUnavailable' | 'Failed' | string;
  readonly examId?: string;
  readonly progress?: number;
  readonly message?: string;
  readonly error?: string;
}

/** Emitted when a new chat message is posted in a classroom. */
export interface NewChatMessageEvent {
  readonly classroomId: string;
  readonly messageId: string;
  readonly senderName: string;
  readonly messageText: string;
  readonly sentAt: string; // ISO 8601
  readonly isAnnouncement: boolean;
}
