// src/app/features/admin/services/admin-classroom-type.service.ts
// Purpose: API client for SuperAdmin classroom type management endpoints.

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../../core/api/api-base.service';
import {
  ClassroomTypeDto,
  CreateClassroomTypeRequest,
  UpdateClassroomTypeRequest,
} from '../models/admin-classroom-type.model';

@Injectable({ providedIn: 'root' })
export class AdminClassroomTypeService extends ApiBaseService {
  private readonly basePath = '/admin/classrooms/types';

  /** GET /api/v1/admin/classrooms/types */
  getAll(): Observable<ClassroomTypeDto[]> {
    return this.get<ClassroomTypeDto[]>(this.basePath);
  }

  /** GET /api/v1/admin/classrooms/types/{id} */
  getById(id: string): Observable<ClassroomTypeDto> {
    return this.get<ClassroomTypeDto>(`${this.basePath}/${id}`);
  }

  /** POST /api/v1/admin/classrooms/types */
  create(request: CreateClassroomTypeRequest): Observable<ClassroomTypeDto> {
    return this.post<ClassroomTypeDto, CreateClassroomTypeRequest>(this.basePath, request);
  }

  /** PUT /api/v1/admin/classrooms/types/{id} */
  update(id: string, request: UpdateClassroomTypeRequest): Observable<void> {
    return this.put<void, UpdateClassroomTypeRequest>(`${this.basePath}/${id}`, request);
  }

  /** DELETE /api/v1/admin/classrooms/types/{id} */
  deactivate(id: string): Observable<void> {
    return this.delete<void>(`${this.basePath}/${id}`);
  }
}
