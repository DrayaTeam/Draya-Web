// src/app/features/teacher/services/teacher-attempt-review.service.ts
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiBaseService } from '../../../core/api/api-base.service';
import {
  PendingReviewClassroomDto,
  OverrideScoreRequestDto,
} from '../../../core/models/teacher-attempt-review.model';
import { AttemptResultResponseDto } from '../../../core/models/student-exam-taking.model';

/**
 * Teacher-side attempt review: the "Pending Reviews" dashboard widget and the
 * per-answer score override flow. The exams-per-attempts LIST already exists
 * (TeacherExamService.getExamAttempts, ExamAttemptsComponent at
 * /teacher/exams/:id/attempts) — this service only covers what was still
 * missing: knowing which attempts need review across all classrooms, and
 * actually grading one.
 */
@Injectable({ providedIn: 'root' })
export class TeacherAttemptReviewService extends ApiBaseService {
  /** GET /api/v1/teachers/pending-reviews (typed in swagger). */
  getPendingReviews(): Observable<PendingReviewClassroomDto[]> {
    return this.get<PendingReviewClassroomDto[]>('/teachers/pending-reviews').pipe(
      catchError(() => of([])),
    );
  }

  /**
   * GET /api/v1/attempts/{attemptId}/results — shared with the student flow
   * (student-exam-taking.service.ts). The teacher view of this same payload
   * additionally carries questionText/questionType/rubric/isFinalized per the
   * backend hand-off doc, already reflected in AttemptResultResponseDto.
   */
  getAttemptResults(attemptId: string): Observable<AttemptResultResponseDto | null> {
    return this.get<AttemptResultResponseDto>(`/attempts/${attemptId}/results`).pipe(
      catchError(() => of(null)),
    );
  }

  /**
   * PUT /api/v1/attempts/{attemptId}/answers/{answerId}/override — 204 No Content.
   * The backend recalculates the attempt score, appends weakness history, and
   * invalidates the AI review cache atomically; the client does not attempt any
   * of that itself and always refetches results afterward to reflect it.
   */
  overrideAnswerScore(attemptId: string, answerId: string, newScore: number): Observable<boolean> {
    const payload: OverrideScoreRequestDto = { newScore };
    return this.put<void>(`/attempts/${attemptId}/answers/${answerId}/override`, payload).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }
}
