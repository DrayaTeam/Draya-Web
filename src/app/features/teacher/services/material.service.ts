// src/app/features/teacher/services/material.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ClassroomMaterialDto,
  MaterialVersionDto,
  MaterialStreamDto,
} from '../../../core/models/material.model';
import { PaginatedResponse } from '../../../core/models/classroom.model';

@Injectable({ providedIn: 'root' })
export class MaterialService {
  private readonly http = inject(HttpClient);
  // Using the confirmed /api/v1/ prefix
  private readonly baseUrl = `${environment.apiBaseUrl}/classrooms`;
  private readonly materialBaseUrl = `${environment.apiBaseUrl}/materials`;

  /** Retrieves the paginated materials for a classroom */
  getClassroomMaterials(
    classroomId: string,
    pageNumber: number,
    pageSize: number,
  ): Observable<PaginatedResponse<ClassroomMaterialDto>> {
    const params = new URLSearchParams();
    params.set('page', pageNumber.toString());
    params.set('pageSize', pageSize.toString());
    return this.http.get<PaginatedResponse<ClassroomMaterialDto>>(
      `${this.baseUrl}/${classroomId}/materials?${params.toString()}`,
    );
  }

  /** Uploads a new material via FormData */
  addMaterial(classroomId: string, formData: FormData): Observable<ClassroomMaterialDto> {
    return this.http.post<ClassroomMaterialDto>(
      `${this.baseUrl}/${classroomId}/materials`,
      formData,
    );
  }

  /** Uploads a new material to a specific section via FormData */
  addMaterialToSection(sectionId: string, formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}/sections/${sectionId}/materials`, formData);
  }

  /** Fully removes a material from a classroom */
  removeMaterial(materialId: string): Observable<void> {
    return this.http.delete<void>(`${this.materialBaseUrl}/${materialId}`);
  }

  /** Uploads a new version to an existing material */
  uploadMaterialVersion(materialId: string, formData: FormData): Observable<MaterialVersionDto> {
    return this.http.post<MaterialVersionDto>(
      `${this.materialBaseUrl}/${materialId}/versions`,
      formData,
    );
  }

  /** Gets the version history for a material */
  getMaterialVersions(materialId: string): Observable<MaterialVersionDto[]> {
    return this.http.get<MaterialVersionDto[]>(`${this.materialBaseUrl}/${materialId}/versions`);
  }

  /** Polls the status of a specific version */
  getVersionStatus(
    materialId: string,
    versionId: string,
  ): Observable<{ versionId: string; parseStatus: string; errorMessage: string | null }> {
    return this.http.get<{ versionId: string; parseStatus: string; errorMessage: string | null }>(
      `${this.materialBaseUrl}/${materialId}/versions/${versionId}/status`,
    );
  }

  /** Returns the stream metadata for video/pdf/link */
  getMaterialStream(materialId: string): Observable<MaterialStreamDto> {
    return this.http.get<MaterialStreamDto>(`${this.materialBaseUrl}/${materialId}/stream`);
  }
}
