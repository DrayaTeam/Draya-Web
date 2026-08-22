import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  PerformanceReportDto,
  StudentAnalyticsDto,
  InteractiveReviewDto,
} from '../../../core/models/teacher-reports.model';

@Injectable({ providedIn: 'root' })
export class TeacherReportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Approves a generated report to send it to the parent.
   */
  approveReport(reportId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/Reports/${reportId}/approve`, {});
  }

  /**
   * Retrieves the latest performance report for a student.
   */
  getLatestPerformanceReport(studentId: string): Observable<PerformanceReportDto> {
    return this.http.get<PerformanceReportDto>(
      `${this.baseUrl}/students/${studentId}/performance-reports/latest`,
    );
  }

  /**
   * Retrieves an interactive review/revision for a specific weak topic.
   */
  getInteractiveReview(studentId: string, topicName: string): Observable<InteractiveReviewDto> {
    return this.http.get<InteractiveReviewDto>(
      `${this.baseUrl}/students/${studentId}/weak-topics/${encodeURIComponent(topicName)}/revision`,
    );
  }

  /**
   * Generates a practice exam for a specific weak topic.
   */
  generatePracticeExam(studentId: string, topicName: string, subjectId: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/students/${studentId}/weak-topics/${encodeURIComponent(topicName)}/practice-exam`,
      { subjectId },
    );
  }

  /**
   * Retrieves analytics for a specific student.
   */
  getStudentAnalytics(studentId: string): Observable<StudentAnalyticsDto> {
    return this.http.get<StudentAnalyticsDto>(`${this.baseUrl}/students/${studentId}/analytics`);
  }
}
