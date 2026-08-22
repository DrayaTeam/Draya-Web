// src/app/features/teacher/services/teacher-reports.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../../../core/api/api-base.service';
import {
  StudentAnalyticsDto,
  PerformanceReportDto,
} from '../../../core/models/teacher-reports.model';

@Injectable({
  providedIn: 'root',
})
export class TeacherReportsService extends ApiBaseService {
  /**
   * Fetches analytics for a specific student.
   * GET /api/v1/students/{studentId}/analytics
   */
  getStudentAnalytics(studentId: string): Observable<StudentAnalyticsDto> {
    return this.get<StudentAnalyticsDto>(`/students/${studentId}/analytics`);
  }

  /**
   * Fetches the latest AI performance report for a specific student.
   * GET /api/v1/students/{studentId}/performance-reports/latest
   */
  getLatestPerformanceReport(studentId: string): Observable<PerformanceReportDto> {
    return this.get<PerformanceReportDto>(`/students/${studentId}/performance-reports/latest`);
  }

  /**
   * Approves a performance report and publishes it to student & parents.
   * POST /api/v1/Reports/{reportId}/approve
   */
  approveReport(reportId: string): Observable<{ message?: string }> {
    return this.post<{ message?: string }>(`/Reports/${reportId}/approve`, {});
  }
}
