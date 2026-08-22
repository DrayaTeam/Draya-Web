import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ClassroomService } from '../services/classroom.service';
import { TeacherReportsService } from '../services/teacher-reports.service';
import { ClassroomDto } from '../../../core/models/classroom.model';
import { StudentRosterItemDto } from '../../../core/models/student-roster.model';
import { TranslatePipe } from '@ngx-translate/core';
import {
  StudentAnalyticsDto,
  PerformanceReportDto,
} from '../../../core/models/teacher-reports.model';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'draya-teacher-reports',
  standalone: true,
  imports: [CommonModule, SelectModule, FormsModule, TranslatePipe, DialogModule],
  templateUrl: './teacher-reports.component.html',
  styleUrl: './teacher-reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherReportsComponent implements OnInit {
  private readonly classroomService = inject(ClassroomService);
  private readonly reportsService = inject(TeacherReportsService);
  private readonly messageService = inject(MessageService);

  readonly classrooms = signal<ClassroomDto[]>([]);
  readonly selectedClassroom = signal<ClassroomDto | null>(null);

  readonly students = signal<StudentRosterItemDto[]>([]);
  readonly selectedStudent = signal<StudentRosterItemDto | null>(null);
  readonly isLoadingStudents = signal<boolean>(false);

  // Right pane data
  readonly studentAnalytics = signal<StudentAnalyticsDto | null>(null);
  readonly latestReport = signal<PerformanceReportDto | null>(null);
  readonly isLoadingAnalytics = signal<boolean>(false);
  readonly isApproving = signal<boolean>(false);

  ngOnInit(): void {
    this.loadClassrooms();
  }

  private loadClassrooms(): void {
    this.classroomService.getTeacherClassrooms(1, 100).subscribe({
      next: (res) => {
        this.classrooms.set(res.items);
        if (res.items.length > 0) {
          this.selectedClassroom.set(res.items[0]);
          this.onClassroomSelect();
        }
      },
      error: (err) => console.error('Failed to load classrooms', err),
    });
  }

  onClassroomSelect(): void {
    const classroom = this.selectedClassroom();
    if (!classroom) return;

    this.selectedStudent.set(null);
    this.studentAnalytics.set(null);
    this.latestReport.set(null);
    this.students.set([]);
    this.isLoadingStudents.set(true);

    this.classroomService.getClassroomStudents(classroom.classroomId, 1, 100).subscribe({
      next: (res) => {
        this.students.set(res.items);
        this.isLoadingStudents.set(false);
      },
      error: (err) => {
        console.error('Failed to load students', err);
        this.isLoadingStudents.set(false);
      },
    });
  }

  onStudentSelect(): void {
    const student = this.selectedStudent();
    if (student) {
      this.loadStudentData(student.studentId);
    } else {
      this.studentAnalytics.set(null);
      this.latestReport.set(null);
    }
  }

  selectStudent(student: StudentRosterItemDto): void {
    this.selectedStudent.set(student);
    this.loadStudentData(student.studentId);
  }

  private loadStudentData(studentId: string): void {
    this.isLoadingAnalytics.set(true);
    this.studentAnalytics.set(null);
    this.latestReport.set(null);

    this.reportsService.getStudentAnalytics(studentId).subscribe({
      next: (analytics) => {
        this.studentAnalytics.set(analytics);
        this.isLoadingAnalytics.set(false);
      },
      error: (err) => {
        console.error('Failed to load analytics', err);
        this.isLoadingAnalytics.set(false);
      },
    });

    this.reportsService.getLatestPerformanceReport(studentId).subscribe({
      next: (report) => {
        this.latestReport.set(report);
      },
      error: (err) => {
        // 404 is expected if no report exists
        console.warn('No latest report found', err);
      },
    });
  }

  approveReport(): void {
    const report = this.latestReport();
    if (!report) return;

    this.isApproving.set(true);
    this.reportsService.approveReport(report.id).subscribe({
      next: (res: { message?: string } | null) => {
        this.isApproving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: res?.message || 'تم اعتماد التقرير وإرساله بنجاح.',
        });
      },
      error: (err) => {
        console.error('Failed to approve report', err);
        this.isApproving.set(false);
      },
    });
  }
}
