import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClassroomSectionDto, CreateSectionRequest, UpdateSectionRequest } from '../../../core/models/section.model';

@Injectable({ providedIn: 'root' })
export class SectionService {
  private readonly http = inject(HttpClient);
  
  private readonly baseUrl = environment.apiBaseUrl;

  getSections(classroomId: string): Observable<ClassroomSectionDto[]> {
    return this.http.get<ClassroomSectionDto[]>(`${this.baseUrl}/classrooms/${classroomId}/sections`);
  }

  createSection(classroomId: string, body: CreateSectionRequest): Observable<ClassroomSectionDto> {
    return this.http.post<ClassroomSectionDto>(`${this.baseUrl}/classrooms/${classroomId}/sections`, body);
  }

  updateSection(sectionId: string, body: UpdateSectionRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/classrooms/sections/${sectionId}`, body);
  }

  deleteSection(sectionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/classrooms/sections/${sectionId}`);
  }
}
