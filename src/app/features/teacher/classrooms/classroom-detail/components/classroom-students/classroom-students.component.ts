// src/app/features/teacher/classrooms/classroom-detail/components/classroom-students/classroom-students.component.ts
import { Component, ChangeDetectionStrategy, input, inject, signal, effect, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ClassroomService } from '../../../../services/classroom.service';
import {
  StudentRosterItemDto,
  StudentRosterItemDtoPagedResult,
} from '../../../../../../core/models/student-roster.model';
import { finalize } from 'rxjs/operators';
import { TeacherModalComponent } from '../../../../components/teacher-modal/teacher-modal.component';
import { DrayaPaginationComponent } from '../../../../../../shared/components/pagination/pagination.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'draya-classroom-students',
  standalone: true,
  imports: [CommonModule, DatePipe, TableModule, ButtonModule, TooltipModule, TeacherModalComponent, DrayaPaginationComponent, FormsModule],
  templateUrl: './classroom-students.component.html',
  styleUrl: './classroom-students.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassroomStudentsComponent {
  readonly classroomId = input.required<string>();

  private readonly classroomService = inject(ClassroomService);
  private readonly messageService = inject(MessageService, { optional: true });

  readonly rawRosterResult = signal<StudentRosterItemDtoPagedResult | null>(null);
  readonly isLoading = signal<boolean>(false);

  // Search & Pagination state
  readonly searchTerm = signal<string>('');
  pageNumber = 1;
  pageSize = 10;

  readonly rosterResult = computed(() => {
    const res = this.rawRosterResult();
    if (!res) return null;

    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return res;

    const filteredItems = res.items.filter(s => s.fullName.toLowerCase().includes(term));
    return {
      ...res,
      items: filteredItems,
      totalCount: filteredItems.length
    };
  });

  // Modal State
  readonly isRemoveStudentModalOpen = signal<boolean>(false);
  readonly selectedStudentForRemoval = signal<StudentRosterItemDto | null>(null);

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
          this.rawRosterResult.set(res);
          this.classroomService.setCurrentRosterTotalCount(res.totalCount);
        },
        error: (err) => {
          console.error('Failed to load students roster', err);
          this.rawRosterResult.set(null);
        },
      });
  }

  onPageChange(newPage: number): void {
    this.pageNumber = newPage;
    this.loadStudents();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.pageNumber = 1;
    this.loadStudents();
  }

  openRemoveModal(student: StudentRosterItemDto): void {
    this.selectedStudentForRemoval.set(student);
    this.isRemoveStudentModalOpen.set(true);
  }

  confirmRemoveStudent(): void {
    const student = this.selectedStudentForRemoval();
    if (student) {
      this.removeStudent(student.studentId);
    }
  }

  private removeStudent(studentId: string): void {
    const cid = this.classroomId();
    this.classroomService.removeStudentFromClassroom(cid, studentId).subscribe({
      next: () => {
        this.messageService?.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم إزالة الطالب بنجاح.',
        });
        this.isRemoveStudentModalOpen.set(false);
        this.selectedStudentForRemoval.set(null);
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
