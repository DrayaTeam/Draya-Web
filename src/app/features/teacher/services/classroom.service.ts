// src/app/features/teacher/services/classroom.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ClassroomDto,
  CreateClassroomRequest,
  ClassroomTypeDto,
  GradeLevelDto,
  SubjectDto
} from '../../../core/models/classroom.model';

@Injectable({ providedIn: 'root' })
export class ClassroomService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/classrooms`;
  private readonly subjectUrl = `${environment.apiBaseUrl}/subjects`;

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
}
