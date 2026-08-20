// src/app/features/teacher/services/qa.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  QuestionDto,
  QuestionDetailsDto,
  QuestionReplyDto,
  QuestionFilters,
} from '../../../core/models/qa.model';
import { PaginatedResponse } from '../../../core/models/classroom.model';

@Injectable({ providedIn: 'root' })
export class QaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/classrooms`;

  /** Retrieves a paginated list of questions for a classroom */
  getQuestions(
    classroomId: string,
    filters: QuestionFilters,
  ): Observable<PaginatedResponse<QuestionDto>> {
    let params = new HttpParams()
      .set('page', filters.pageNumber.toString())
      .set('pageSize', filters.pageSize.toString());

    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters.filterBy) {
      params = params.set('filterBy', filters.filterBy);
    }

    return this.http.get<PaginatedResponse<QuestionDto>>(
      `${this.baseUrl}/${classroomId}/questions`,
      { params },
    );
  }

  /** Retrieves a specific question with its replies */
  getQuestionDetails(classroomId: string, questionId: string): Observable<QuestionDetailsDto> {
    return this.http.get<QuestionDetailsDto>(
      `${this.baseUrl}/${classroomId}/questions/${questionId}`,
    );
  }

  /** Posts a new question to the classroom */
  createQuestion(classroomId: string, content: string): Observable<QuestionDto> {
    return this.http.post<QuestionDto>(`${this.baseUrl}/${classroomId}/questions`, { content });
  }

  /** Updates an existing question */
  updateQuestion(classroomId: string, questionId: string, content: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${classroomId}/questions/${questionId}`, {
      content,
    });
  }

  /** Deletes an existing question */
  deleteQuestion(classroomId: string, questionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${classroomId}/questions/${questionId}`);
  }

  /** Posts a new question with an image attachment */
  createQuestionWithPhoto(
    classroomId: string,
    content: string,
    file: File,
  ): Observable<QuestionDto> {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('file', file);
    return this.http.post<QuestionDto>(
      `${this.baseUrl}/${classroomId}/questions/with-photo`,
      formData,
    );
  }

  /** Posts a reply to an existing question */
  createReply(
    classroomId: string,
    questionId: string,
    content: string,
  ): Observable<QuestionReplyDto> {
    return this.http.post<QuestionReplyDto>(
      `${this.baseUrl}/${classroomId}/questions/${questionId}/replies`,
      { content },
    );
  }

  /** Updates an existing reply */
  updateReply(
    classroomId: string,
    questionId: string,
    replyId: string,
    content: string,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/${classroomId}/questions/${questionId}/replies/${replyId}`,
      { content },
    );
  }

  /** Deletes an existing reply */
  deleteReply(classroomId: string, questionId: string, replyId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${classroomId}/questions/${questionId}/replies/${replyId}`,
    );
  }

  /** Posts a reply with an image attachment */
  createReplyWithPhoto(
    classroomId: string,
    questionId: string,
    content: string,
    file: File,
  ): Observable<QuestionReplyDto> {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('file', file);
    return this.http.post<QuestionReplyDto>(
      `${this.baseUrl}/${classroomId}/questions/${questionId}/replies/with-photo`,
      formData,
    );
  }

  /** Votes or unvotes on a question based on current state */
  toggleVote(classroomId: string, questionId: string, currentlyVoted: boolean): Observable<void> {
    const url = `${this.baseUrl}/${classroomId}/questions/${questionId}/vote`;
    if (currentlyVoted) {
      return this.http.delete<void>(url);
    } else {
      return this.http.post<void>(url, {});
    }
  }
}
