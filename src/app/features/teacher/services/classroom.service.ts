// src/app/features/teacher/services/classroom.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ClassroomDto,
  CreateClassroomRequest,
  ClassroomTypeDto,
  GradeLevelDto,
  SubjectDto,
  ClassroomDtoPagedResult
} from '../../../core/models/classroom.model';

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
  private readonly _filters = signal<ClassroomFilters>({ pageNumber: 1, pageSize: 12 });

  // Readonly exposure
  readonly classroomsResult = this._classroomsResult.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
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
    return this.http.post<SubjectDto>(this.subjectUrl, { name });
  }

  /** Creates a new classroom */
  createClassroom(payload: CreateClassroomRequest): Observable<ClassroomDto> {
    return this.http.post<ClassroomDto>(this.baseUrl, payload);
  }

  /** Update filters (triggers a reload implicitly by the component watching it or explicitly) */
  setFilters(newFilters: Partial<ClassroomFilters>): void {
    this._filters.update(curr => ({ ...curr, ...newFilters }));
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
    this.http.get<ClassroomDtoPagedResult>(`${this.baseUrl}?${params.toString()}`).subscribe({
      next: (res) => {
        this._classroomsResult.set(res);
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load classrooms', err);
        this._classroomsResult.set(null);
        this._isLoading.set(false);
      }
    });
  }
}
