// src/app/features/admin/services/admin-grade-level.service.ts
// Purpose: API client for SuperAdmin grade level management endpoints.

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../../core/api/api-base.service';
import {
  GradeLevelDto,
  CreateGradeLevelRequest,
  UpdateGradeLevelRequest,
} from '../models/admin-grade-level.model';

@Injectable({ providedIn: 'root' })
export class AdminGradeLevelService extends ApiBaseService {
  private readonly basePath = '/admin/classrooms/grade-levels';

  /** GET /api/v1/admin/classrooms/grade-levels */
  getAll(): Observable<GradeLevelDto[]> {
    return this.get<GradeLevelDto[]>(this.basePath);
  }

  /** GET /api/v1/admin/classrooms/grade-levels/{id} */
  getById(id: string): Observable<GradeLevelDto> {
    return this.get<GradeLevelDto>(`${this.basePath}/${id}`);
  }

  /** POST /api/v1/admin/classrooms/grade-levels */
  create(request: CreateGradeLevelRequest): Observable<GradeLevelDto> {
    return this.post<GradeLevelDto, CreateGradeLevelRequest>(this.basePath, request);
  }

  /** PUT /api/v1/admin/classrooms/grade-levels/{id} */
  update(id: string, request: UpdateGradeLevelRequest): Observable<void> {
    return this.put<void, UpdateGradeLevelRequest>(`${this.basePath}/${id}`, request);
  }

  /** DELETE /api/v1/admin/classrooms/grade-levels/{id} */
  deactivate(id: string): Observable<void> {
    return this.delete<void>(`${this.basePath}/${id}`);
  }
}
