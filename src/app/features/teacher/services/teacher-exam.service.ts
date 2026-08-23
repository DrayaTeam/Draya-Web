import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  TeacherExamDto,
  UpdateQuestionRequest,
  RefineQuestionRequest,
  ExamQuestionDto,
  GeneratedQuestionDto,
  ExamAttemptDto,
} from '../../../core/models/teacher-exam.model';

@Injectable({
  providedIn: 'root',
})
export class TeacherExamService {
  getExamAttempts(examId: string, page = 1, pageSize = 50): Observable<{ items: ExamAttemptDto[]; totalCount: number }> {
    return this.http.get<{ items: ExamAttemptDto[]; totalCount: number }>(`${this.baseUrl}/${examId}/attempts?page=${page}&pageSize=${pageSize}`);
  }

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/exams`;

  getExam(examId: string): Observable<TeacherExamDto> {
    return this.http.get<TeacherExamDto>(`${this.baseUrl}/${examId}`);
  }

  getExams(
    classroomId?: string,
    page = 1,
    pageSize = 10,
  ): Observable<
    | {
        items?: TeacherExamDto[];
        totalCount?: number;
        data?: TeacherExamDto[];
        exams?: TeacherExamDto[];
      }
    | TeacherExamDto[]
  > {
    let url = `${this.baseUrl}?page=${page}&pageSize=${pageSize}`;
    if (classroomId) {
      url += `&classroomId=${classroomId}`;
    }
    return this.http.get<
      | {
          items?: TeacherExamDto[];
          totalCount?: number;
          data?: TeacherExamDto[];
          exams?: TeacherExamDto[];
        }
      | TeacherExamDto[]
    >(url);
  }

  updateQuestion(
    examId: string,
    questionId: string,
    payload: UpdateQuestionRequest,
  ): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${examId}/questions/${questionId}`, payload);
  }

  refineQuestion(
    examId: string,
    questionId: string,
    payload: RefineQuestionRequest,
  ): Observable<GeneratedQuestionDto> {
    return this.http.post<GeneratedQuestionDto>(
      `${this.baseUrl}/${examId}/questions/${questionId}/refine`,
      payload,
    );
  }

  // Not strictly used in Step 3 plan, but good to have based on earlier design
  addQuestion(examId: string, payload: UpdateQuestionRequest): Observable<ExamQuestionDto> {
    return this.http.post<ExamQuestionDto>(`${this.baseUrl}/${examId}/questions`, payload);
  }
}
