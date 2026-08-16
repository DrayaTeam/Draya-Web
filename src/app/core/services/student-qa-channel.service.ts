// src/app/core/services/student-qa-channel.service.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of, tap, catchError } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { ApiBaseService } from '../api/api-base.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { environment } from '../../../environments/environment';
import {
  QuestionItem,
  QuestionReplyItem,
  QuestionDetailsResponse,
  QuestionsPagedResponse,
  QuestionSortBy,
  QuestionFilterBy,
  SignalRQuestionCreatedPayload,
  SignalRQuestionRepliedPayload,
  SignalRQuestionVoteUpdatedPayload,
} from '../models/student-channel.model';

@Injectable({ providedIn: 'root' })
export class StudentQaChannelService extends ApiBaseService {
  private readonly auth = inject(AuthService);

  private hubConnection: signalR.HubConnection | null = null;
  private currentJoinedClassroomId: string | null = null;

  // State Signals
  readonly questions = signal<QuestionItem[]>([]);
  readonly totalQuestionsCount = signal<number>(0);
  readonly loading = signal<boolean>(false);
  readonly sendingQuestion = signal<boolean>(false);
  readonly sendingReply = signal<boolean>(false);

  // Active Thread Details State
  readonly activeQuestion = signal<QuestionItem | null>(null);
  readonly activeReplies = signal<QuestionReplyItem[]>([]);
  readonly loadingReplies = signal<boolean>(false);

  // Filter & Sort State
  readonly currentSortBy = signal<QuestionSortBy>('recent');
  readonly currentFilterBy = signal<QuestionFilterBy>('all');
  readonly searchQuery = signal<string>('');

  readonly filteredQuestions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.questions();
    if (!q) return list;
    return list.filter((item) => item.content.toLowerCase().includes(q));
  });

  // ==========================================
  // SignalR Real-Time Methods
  // ==========================================

  async startSignalRConnection(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const token = this.auth.accessToken();
    const hubUrl = environment.qaHubUrl || 'http://draya-api.runasp.net/hubs/qa';

    try {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token || '',
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.registerSignalREventListeners();
      await this.hubConnection.start();

      if (this.currentJoinedClassroomId) {
        await this.hubConnection.invoke('JoinClassroom', this.currentJoinedClassroomId);
      }
    } catch (err) {
      console.warn('SignalR Q&A Hub connection notice (proceeding in standard REST mode):', err);
    }
  }

  async joinClassroomHub(classroomId: string): Promise<void> {
    if (this.currentJoinedClassroomId && this.currentJoinedClassroomId !== classroomId) {
      await this.leaveClassroomHub(this.currentJoinedClassroomId);
    }

    this.currentJoinedClassroomId = classroomId;

    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('JoinClassroom', classroomId);
      } catch (err) {
        console.warn('JoinClassroom SignalR invocation failed:', err);
      }
    }
  }

  async leaveClassroomHub(classroomId: string): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('LeaveClassroom', classroomId);
      } catch (err) {
        console.warn('LeaveClassroom SignalR invocation failed:', err);
      }
    }
    if (this.currentJoinedClassroomId === classroomId) {
      this.currentJoinedClassroomId = null;
    }
  }

  async stopSignalRConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
      } catch {
        // ignore on destroy
      }
      this.hubConnection = null;
    }
  }

  private registerSignalREventListeners(): void {
    if (!this.hubConnection) return;

    // 1. QuestionCreated Event
    this.hubConnection.on('QuestionCreated', (payload: SignalRQuestionCreatedPayload) => {
      if (payload.classroomId === this.currentJoinedClassroomId) {
        const currentUserId = this.auth.currentUser()?.userId;
        const newQuestion: QuestionItem = {
          id: payload.questionId,
          classroomId: payload.classroomId,
          authorId: payload.authorId,
          content: payload.content,
          createdAt: payload.createdAt || new Date().toISOString(),
          voteCount: 0,
          replyCount: 0,
          hasTeacherAnswer: false,
          hasVoted: false,
          isAuthor: payload.authorId === currentUserId,
        };

        this.questions.update((list) => [newQuestion, ...list]);
        this.totalQuestionsCount.update((c) => c + 1);
      }
    });

    // 2. QuestionReplied Event
    this.hubConnection.on('QuestionReplied', (payload: SignalRQuestionRepliedPayload) => {
      if (payload.classroomId === this.currentJoinedClassroomId) {
        // Update question item in list
        this.questions.update((list) =>
          list.map((q) => {
            if (q.id === payload.questionId) {
              return {
                ...q,
                replyCount: q.replyCount + 1,
                hasTeacherAnswer: q.hasTeacherAnswer || payload.isTeacherAnswer,
              };
            }
            return q;
          }),
        );

        // If thread is active, append reply
        if (this.activeQuestion()?.id === payload.questionId) {
          const currentUserId = this.auth.currentUser()?.userId;
          const newReply: QuestionReplyItem = {
            id: payload.replyId,
            questionId: payload.questionId,
            authorId: payload.authorId,
            content: payload.content,
            createdAt: payload.createdAt || new Date().toISOString(),
            isTeacherAnswer: payload.isTeacherAnswer,
            isAuthor: payload.authorId === currentUserId,
          };

          this.activeReplies.update((replies) => [...replies, newReply]);
        }
      }
    });

    // 3. QuestionVoteUpdated Event
    this.hubConnection.on('QuestionVoteUpdated', (payload: SignalRQuestionVoteUpdatedPayload) => {
      if (payload.classroomId === this.currentJoinedClassroomId) {
        this.questions.update((list) =>
          list.map((q) =>
            q.id === payload.questionId ? { ...q, voteCount: payload.voteCount } : q,
          ),
        );

        if (this.activeQuestion()?.id === payload.questionId) {
          this.activeQuestion.update((q) => (q ? { ...q, voteCount: payload.voteCount } : null));
        }
      }
    });
  }

  // ==========================================
  // REST API Methods
  // ==========================================

  loadQuestions(
    classroomId: string,
    options?: {
      page?: number;
      pageSize?: number;
      sortBy?: QuestionSortBy;
      filterBy?: QuestionFilterBy;
    },
  ): Observable<QuestionsPagedResponse | null> {
    this.loading.set(true);

    const page = options?.page || 1;
    const pageSize = options?.pageSize || 20;
    const sortBy = options?.sortBy || this.currentSortBy();
    const filterBy = options?.filterBy || this.currentFilterBy();

    const queryParams = {
      page,
      pageSize,
      sortBy,
      filterBy,
    };

    return this.get<QuestionsPagedResponse>(
      `/classrooms/${classroomId}/questions`,
      queryParams,
    ).pipe(
      tap((res) => {
        if (res && Array.isArray(res.items)) {
          this.questions.set(res.items);
          this.totalQuestionsCount.set(res.totalCount ?? res.items.length);
        } else {
          this.questions.set([]);
          this.totalQuestionsCount.set(0);
        }
        this.loading.set(false);
      }),
      catchError(() => {
        this.questions.set([]);
        this.totalQuestionsCount.set(0);
        this.loading.set(false);
        return of(null);
      }),
    );
  }

  loadQuestionDetails(
    classroomId: string,
    questionId: string,
  ): Observable<QuestionDetailsResponse | null> {
    this.loadingReplies.set(true);
    return this.get<QuestionDetailsResponse>(
      `/classrooms/${classroomId}/questions/${questionId}`,
    ).pipe(
      tap((res) => {
        if (res && res.question) {
          this.activeQuestion.set(res.question);
          this.activeReplies.set(res.replies || []);
        } else {
          this.activeQuestion.set(null);
          this.activeReplies.set([]);
        }
        this.loadingReplies.set(false);
      }),
      catchError(() => {
        this.activeQuestion.set(null);
        this.activeReplies.set([]);
        this.loadingReplies.set(false);
        return of(null);
      }),
    );
  }

  askQuestion(
    classroomId: string,
    content: string,
    photoFile?: File | null,
  ): Observable<QuestionItem | null> {
    this.sendingQuestion.set(true);

    let request$: Observable<QuestionItem>;
    if (photoFile) {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('file', photoFile);
      request$ = this.post<QuestionItem>(
        `/classrooms/${classroomId}/questions/with-photo`,
        formData,
      );
    } else {
      const body = { content: content.trim() };
      request$ = this.post<QuestionItem>(`/classrooms/${classroomId}/questions`, body);
    }

    return request$.pipe(
      tap((created) => {
        if (created && created.id) {
          this.questions.update((list) => [created, ...list]);
          this.totalQuestionsCount.update((c) => c + 1);
        }
        this.sendingQuestion.set(false);
      }),
      catchError((err) => {
        this.sendingQuestion.set(false);
        // If it's a demo classroom (pkg-1), allow optimistic local question
        if (classroomId.startsWith('pkg-')) {
          const fallbackNew: QuestionItem = {
            id: 'q_' + Date.now(),
            classroomId,
            authorId: this.auth.currentUser()?.userId || 'me',
            authorName: this.auth.currentUser()?.fullName || 'أنا',
            authorRole: 'Student',
            authorProfilePictureUrl: this.auth.currentUser()?.profilePictureUrl,
            imageUrl: photoFile ? URL.createObjectURL(photoFile) : undefined,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            voteCount: 0,
            replyCount: 0,
            hasTeacherAnswer: false,
            hasVoted: false,
            isAuthor: true,
          };
          this.questions.update((list) => [fallbackNew, ...list]);
          this.totalQuestionsCount.update((c) => c + 1);
          return of(fallbackNew);
        }
        throw err;
      }),
    );
  }

  sendReply(
    classroomId: string,
    questionId: string,
    content: string,
    photoFile?: File | null,
  ): Observable<QuestionReplyItem | null> {
    this.sendingReply.set(true);

    let request$: Observable<QuestionReplyItem>;
    if (photoFile) {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('file', photoFile);
      request$ = this.post<QuestionReplyItem>(
        `/classrooms/${classroomId}/questions/${questionId}/replies/with-photo`,
        formData,
      );
    } else {
      const body = { content: content.trim() };
      request$ = this.post<QuestionReplyItem>(
        `/classrooms/${classroomId}/questions/${questionId}/replies`,
        body,
      );
    }

    return request$.pipe(
      tap((created) => {
        if (created && created.id) {
          this.activeReplies.update((list) => [...list, created]);
          this.questions.update((list) =>
            list.map((q) => (q.id === questionId ? { ...q, replyCount: q.replyCount + 1 } : q)),
          );
        }
        this.sendingReply.set(false);
      }),
      catchError((err) => {
        this.sendingReply.set(false);
        if (classroomId.startsWith('pkg-')) {
          const fallbackReply: QuestionReplyItem = {
            id: 'rep_' + Date.now(),
            questionId,
            authorId: this.auth.currentUser()?.userId || 'me',
            authorName: this.auth.currentUser()?.fullName || 'أنا',
            authorRole: 'Student',
            authorProfilePictureUrl: this.auth.currentUser()?.profilePictureUrl,
            imageUrl: photoFile ? URL.createObjectURL(photoFile) : undefined,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            isTeacherAnswer: false,
            isAuthor: true,
          };
          this.activeReplies.update((list) => [...list, fallbackReply]);
          this.questions.update((list) =>
            list.map((q) => (q.id === questionId ? { ...q, replyCount: q.replyCount + 1 } : q)),
          );
          return of(fallbackReply);
        }
        throw err;
      }),
    );
  }

  toggleVote(classroomId: string, questionId: string): void {
    const question = this.questions().find((q) => q.id === questionId);
    if (!question) return;

    const willVote = !question.hasVoted;
    const nextVoteCount = willVote ? question.voteCount + 1 : Math.max(0, question.voteCount - 1);

    // Optimistic UI Update
    this.questions.update((list) =>
      list.map((q) =>
        q.id === questionId ? { ...q, hasVoted: willVote, voteCount: nextVoteCount } : q,
      ),
    );

    if (this.activeQuestion()?.id === questionId) {
      this.activeQuestion.update((q) =>
        q ? { ...q, hasVoted: willVote, voteCount: nextVoteCount } : null,
      );
    }

    const req$ = willVote
      ? this.post<void>(`/classrooms/${classroomId}/questions/${questionId}/vote`, {})
      : this.delete<void>(`/classrooms/${classroomId}/questions/${questionId}/vote`);

    req$
      .pipe(
        catchError(() => {
          // Rollback on server error
          this.questions.update((list) =>
            list.map((q) =>
              q.id === questionId
                ? { ...q, hasVoted: !willVote, voteCount: question.voteCount }
                : q,
            ),
          );
          return of(null);
        }),
      )
      .subscribe();
  }
}
