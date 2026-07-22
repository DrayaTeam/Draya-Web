// src/app/core/api/api-base.service.ts
// Purpose: Shared HttpClient wrapper for all Draya API service classes.
// Provides typed get/post/put/delete methods with the base URL prepended from environment.
// Feature services (e.g., ExamService, StudentService) extend or inject this class
// rather than injecting HttpClient directly, keeping the base URL DRY.

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiBaseService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = environment.apiBaseUrl;

  protected get<T>(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.set(key, String(value));
      });
    }
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams });
  }

  protected post<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  protected put<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }

  protected patch<T, B = unknown>(path: string, body: B): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body);
  }

  protected delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }
}
