// src/app/core/models/student-channel.model.ts

export interface QuestionItem {
  id: string;
  classroomId: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  authorProfilePictureUrl?: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  voteCount: number;
  replyCount: number;
  hasTeacherAnswer: boolean;
  hasVoted: boolean;
  isAuthor: boolean;
}

export interface QuestionReplyItem {
  id: string;
  questionId: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  authorProfilePictureUrl?: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  isTeacherAnswer: boolean;
  isAuthor: boolean;
}

export interface QuestionDetailsResponse {
  question: QuestionItem;
  replies: QuestionReplyItem[];
}

export interface QuestionsPagedResponse {
  items: QuestionItem[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type QuestionSortBy = 'recent' | 'mostvoted' | 'mostdiscussed' | 'trending';
export type QuestionFilterBy = 'all' | 'unanswered' | 'answered' | 'myposts';

export interface SignalRQuestionCreatedPayload {
  classroomId: string;
  questionId: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

export interface SignalRQuestionRepliedPayload {
  classroomId: string;
  questionId: string;
  replyId: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  isTeacherAnswer: boolean;
}

export interface SignalRQuestionVoteUpdatedPayload {
  classroomId: string;
  questionId: string;
  voteCount: number;
}
