// src/app/core/models/qa.model.ts

export interface QuestionDto {
  id: string;
  classroomId: string;
  authorId: string;
  authorName: string;
  authorRole: 'Teacher' | 'Student';
  authorProfilePictureUrl: string | null;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  voteCount: number;
  replyCount: number;
  hasTeacherAnswer: boolean;
  hasVoted: boolean;
  isAuthor: boolean;
}

export interface QuestionReplyDto {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  authorRole: 'Teacher' | 'Student';
  authorProfilePictureUrl: string | null;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  isTeacherAnswer: boolean;
  isAuthor: boolean;
}

export interface QuestionDetailsDto {
  question: QuestionDto;
  replies: QuestionReplyDto[];
}

export interface QuestionFilters {
  pageNumber: number;
  pageSize: number;
  sortBy?: 'newest' | 'oldest' | 'votes';
  filterBy?: 'answered' | 'unanswered' | '';
}
