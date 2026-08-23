import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { TableModule } from 'primeng/table';

import { TeacherExamService } from '../../services/teacher-exam.service';
import { ExamAttemptDto, TeacherExamDto } from '../../../../core/models/teacher-exam.model';
import { StudentDetailsModalComponent } from '../../classrooms/classroom-detail/components/student-details-modal/student-details-modal.component';
import { StudentRosterItemDto } from '../../../../core/models/student-roster.model';

@Component({
  selector: 'draya-exam-attempts',
  standalone: true,
  imports: [CommonModule, RouterLink, TableModule, StudentDetailsModalComponent],
  templateUrl: './exam-attempts.component.html',
  styleUrl: './exam-attempts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamAttemptsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly examService = inject(TeacherExamService);

  readonly examId = signal<string | null>(null);
  readonly exam = signal<TeacherExamDto | null>(null);
  
  readonly attempts = signal<ExamAttemptDto[]>([]);
  readonly totalCount = signal<number>(0);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  readonly isDetailsModalOpen = signal<boolean>(false);
  readonly selectedStudentForDetails = signal<StudentRosterItemDto | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.examId.set(id);
      this.loadExam(id);
      this.loadAttempts(id);
    } else {
      this.error.set('لم يتم العثور على معرف الامتحان.');
      this.isLoading.set(false);
    }
  }

  private loadExam(id: string): void {
    this.examService.getExam(id).subscribe({
      next: (data) => this.exam.set(data),
      error: () => console.error('Failed to load exam details')
    });
  }

  private loadAttempts(id: string): void {
    this.isLoading.set(true);
    this.examService.getExamAttempts(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.attempts.set(res.items || []);
          this.totalCount.set(res.totalCount || 0);
        },
        error: () => {
          this.error.set('حدث خطأ أثناء جلب نتائج الطلاب.');
        }
      });
  }

  openStudentDetails(attempt: ExamAttemptDto): void {
    // We map the attempt back to a StudentRosterItemDto so the modal can fetch analytics
    const mappedStudent: StudentRosterItemDto = {
      studentId: attempt.studentId,
      fullName: attempt.studentName,
      profilePictureUrl: '',
      enrolledAt: attempt.submittedAt,
      status: 'Active'
    };
    
    this.selectedStudentForDetails.set(mappedStudent);
    this.isDetailsModalOpen.set(true);
  }

  closeStudentDetails(): void {
    this.isDetailsModalOpen.set(false);
    this.selectedStudentForDetails.set(null);
  }
}