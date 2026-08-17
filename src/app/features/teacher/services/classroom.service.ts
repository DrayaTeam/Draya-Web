// src/app/features/teacher/services/classroom.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  ClassroomDto,
  CreateClassroomRequest,
  UpdateClassroomRequest,
  ClassroomTypeDto,
  GradeLevelDto,
  SubjectDto,
  ClassroomDtoPagedResult,
} from '../../../core/models/classroom.model';
import { StudentRosterItemDtoPagedResult } from '../../../core/models/student-roster.model';

export interface ClassroomFilters {
  pageNumber: number;
  pageSize: number;
  gradeLevelId?: string;
  subjectId?: string;
}

@Injectable({ providedIn: 'root' })
export class ClassroomService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/classrooms`;
  private readonly subjectUrl = `${environment.apiBaseUrl}/subjects`;

  // State Signals
  private readonly _classroomsResult = signal<ClassroomDtoPagedResult | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _activeClassroom = signal<ClassroomDto | null>(null);
  private readonly _currentRosterTotalCount = signal<number>(0);
  private readonly _filters = signal<ClassroomFilters>({ pageNumber: 1, pageSize: 10 });

  // Readonly exposure
  readonly classroomsResult = this._classroomsResult.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly activeClassroom = this._activeClassroom.asReadonly();
  readonly currentRosterTotalCount = this._currentRosterTotalCount.asReadonly();
  readonly filters = this._filters.asReadonly();

  /** Retrieves the teacher-accessible classroom types */
  getClassroomTypes(): Observable<ClassroomTypeDto[]> {
    return this.http.get<ClassroomTypeDto[]>(`${this.baseUrl}/types`);
  }

  /** Retrieves the teacher-accessible grade levels */
  getGradeLevels(): Observable<GradeLevelDto[]> {
    return this.http.get<GradeLevelDto[]>(`${this.baseUrl}/grade-levels`);
  }

  /** Retrieves all subjects (requires auth) */
  getSubjects(): Observable<SubjectDto[]> {
    return this.http.get<SubjectDto[]>(this.subjectUrl);
  }

  /** Creates a new subject on the fly */
  createSubject(name: string): Observable<SubjectDto> {
    return this.http.post<SubjectDto>(`${environment.apiBaseUrl}/subjects`, { name });
  }

  /** Retrieves a specific classroom by ID */
  getClassroomById(id: string): Observable<ClassroomDto> {
    this._isLoading.set(true);
    // Reset roster count when loading a new classroom so we don't flash old data
    this._currentRosterTotalCount.set(0);
    return this.http.get<ClassroomDto>(`${this.baseUrl}/${id}`).pipe(
      tap((classroom) => this._activeClassroom.set(classroom)),
      finalize(() => this._isLoading.set(false)),
    );
  }

  /** Creates a new classroom */
  createClassroom(payload: CreateClassroomRequest): Observable<ClassroomDto> {
    return this.http.post<ClassroomDto>(this.baseUrl, payload);
  }

  /** Updates an existing classroom */
  updateClassroom(id: string, payload: UpdateClassroomRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  /** Deactivates a classroom (soft delete) */
  deactivateClassroom(classroomId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${classroomId}`);
  }

  /** Regenerates the enrollment code for a classroom */
  regenerateEnrollmentCode(classroomId: string): Observable<ClassroomDto> {
    return this.http.post<ClassroomDto>(`${this.baseUrl}/${classroomId}/regenerate-code`, {});
  }

  /** Retrieves the paginated student roster for a classroom */
  getClassroomStudents(
    classroomId: string,
    pageNumber: number,
    pageSize: number,
  ): Observable<StudentRosterItemDtoPagedResult> {
    const params = new URLSearchParams();
    params.set('page', pageNumber.toString());
    params.set('pageSize', pageSize.toString());
    // Note: User explicitly confirmed API uses /api/v1/ here, which is already in environment.apiBaseUrl
    return this.http.get<StudentRosterItemDtoPagedResult>(
      `${this.baseUrl}/${classroomId}/students?${params.toString()}`,
    );
  }

  /** Fully removes a student from a classroom */
  removeStudentFromClassroom(classroomId: string, studentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${classroomId}/students/${studentId}`);
  }

  /** Update the active classroom explicitly */
  setActiveClassroom(classroom: ClassroomDto): void {
    this._activeClassroom.set(classroom);
  }

  /** Update the true roster count explicitly from the students component */
  setCurrentRosterTotalCount(count: number): void {
    this._currentRosterTotalCount.set(count);
  }

  /** Update filters (triggers a reload implicitly by the component watching it or explicitly) */
  setFilters(newFilters: Partial<ClassroomFilters>): void {
    this._filters.update((curr) => ({ ...curr, ...newFilters }));
  }

  /** Retrieves classrooms based on current filters in state */
  loadClassrooms(): void {
    const f = this._filters();
    const params = new URLSearchParams();
    params.set('pageNumber', f.pageNumber.toString());
    params.set('pageSize', f.pageSize.toString());

    if (f.gradeLevelId) {
      params.set('gradeLevelId', f.gradeLevelId);
    }
    if (f.subjectId) {
      params.set('subjectId', f.subjectId);
    }

    this._isLoading.set(true);
    // Use the base endpoint which returns ONLY the logged-in teacher's classrooms
    this.http.get<ClassroomDtoPagedResult>(`${this.baseUrl}?${params.toString()}`).subscribe({
      next: (res) => {
        this._classroomsResult.set(res);
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load classrooms', err);
        this._classroomsResult.set(null);
        this._isLoading.set(false);
      },
    });
  }
}
