import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GenerateExamRequest, GenerateExamResponse } from '../../../core/models/exam-generation.model';

@Injectable({
  providedIn: 'root'
})
export class ExamGenerationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/exams`;

  /**
   * Generates a new AI exam.
   * Note: The idempotencyKey is generated freshly inside this method to ensure every call gets a unique ID.
   */
  generateExam(request: Omit<GenerateExamRequest, 'idempotencyKey'>): Observable<GenerateExamResponse> {
    const payload: GenerateExamRequest = {
      ...request,
      idempotencyKey: crypto.randomUUID()
    };
    
    return this.http.post<GenerateExamResponse>(`${this.baseUrl}/generate`, payload);
  }

  /**
   * Fallback HTTP polling for generation progress.
   */
  getGenerationStatus(generationId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/generations/${generationId}`);
  }
}
