// src/app/features/teacher/classrooms/classroom-detail/components/classroom-students/classroom-students.component.ts
import { Component, ChangeDetectionStrategy, input, inject, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClassroomService } from '../../../../services/classroom.service';
import {
  StudentRosterItemDto,
  StudentRosterItemDtoPagedResult,
} from '../../../../../../core/models/student-roster.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'draya-classroom-students',
  standalone: true,
  imports: [CommonModule, DatePipe, TableModule, ButtonModule, TooltipModule],
  templateUrl: './classroom-students.component.html',
  styleUrl: './classroom-students.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassroomStudentsComponent {
  readonly classroomId = input.required<string>();

  private readonly classroomService = inject(ClassroomService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService, { optional: true });

  readonly rosterResult = signal<StudentRosterItemDtoPagedResult | null>(null);
  readonly isLoading = signal<boolean>(false);

  // Pagination state
  pageNumber = 1;
  pageSize = 10;

  constructor() {
    effect(() => {
      // Re-fetch when classroomId changes
      const id = this.classroomId();
      if (id) {
        this.pageNumber = 1;
        this.loadStudents();
      }
    });
  }

  loadStudents(): void {
    const id = this.classroomId();
    if (!id) return;

    this.isLoading.set(true);
    this.classroomService
      .getClassroomStudents(id, this.pageNumber, this.pageSize)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          this.rosterResult.set(res);
          this.classroomService.setCurrentRosterTotalCount(res.totalCount);
        },
        error: (err) => {
          console.error('Failed to load students roster', err);
          this.rosterResult.set(null);
        },
      });
  }

  onPageChange(event: TableLazyLoadEvent): void {
    // PrimeNG Table passes first and rows
    const first = event.first ?? 0;
    const rows = event.rows ?? 10;
    this.pageSize = rows;
    this.pageNumber = first / rows + 1;
    this.loadStudents();
  }

  confirmRemoveStudent(student: StudentRosterItemDto): void {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من إزالة الطالب ${student.fullName} من هذه المجموعة؟`,
      header: 'تأكيد الإزالة',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، إزالة',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.removeStudent(student.studentId);
      },
    });
  }

  private removeStudent(studentId: string): void {
    const cid = this.classroomId();
    this.classroomService.removeStudentFromClassroom(cid, studentId).subscribe({
      next: () => {
        this.messageService?.add({
          severity: 'success',
          summary: 'تم بنجاح',
          detail: 'تمت إزالة الطالب من المجموعة.',
        });
        // Reload current page to reflect deletion
        this.loadStudents();
        // Also reload the parent classroom to update the student count in the hero stats
        this.classroomService.getClassroomById(cid).subscribe();
      },
      error: (err) => {
        console.error('Failed to remove student', err);
        this.messageService?.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء إزالة الطالب. يرجى المحاولة مرة أخرى.',
        });
      },
    });
  }
}
