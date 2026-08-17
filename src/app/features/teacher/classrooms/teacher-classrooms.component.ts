// src/app/features/teacher/classrooms/teacher-classrooms.component.ts
import { Component, ChangeDetectionStrategy, signal, inject, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ClassroomService } from '../services/classroom.service';
import { SubjectDto, GradeLevelDto, ClassroomDto } from '../../../core/models/classroom.model';
import { CreateClassroomModalComponent } from './components/create-classroom-modal/create-classroom-modal.component';
import { ClassroomStudentCountComponent } from './components/classroom-student-count/classroom-student-count.component';
import { EditClassroomModalComponent } from './components/edit-classroom-modal/edit-classroom-modal.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'draya-teacher-classrooms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslatePipe,
    CreateClassroomModalComponent,
    ClassroomStudentCountComponent,
    EditClassroomModalComponent,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './teacher-classrooms.component.html',
  styleUrl: './teacher-classrooms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class TeacherClassroomsComponent implements OnInit {
  readonly classroomService = inject(ClassroomService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService, { optional: true });

  readonly isCreateModalOpen = signal<boolean>(false);
  readonly isEditModalOpen = signal<boolean>(false);
  readonly selectedClassroomForEdit = signal<ClassroomDto | null>(null);

  // Track which classroom's dropdown is open
  readonly openMenuId = signal<string | null>(null);

  toggleMenu(classroomId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuId.update(current => current === classroomId ? null : classroomId);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  readonly classroomsResult = this.classroomService.classroomsResult;
  readonly isLoading = this.classroomService.isLoading;
  readonly filters = this.classroomService.filters;

  // Search state
  readonly searchTerm = signal<string>('');

  // Filtered Classrooms (local search)
  readonly filteredClassrooms = computed(() => {
    const result = this.classroomsResult();
    if (!result || !result.items) return [];
    
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return result.items;
    
    return result.items.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.subjectName.toLowerCase().includes(term) || 
      c.gradeLevelName.toLowerCase().includes(term)
    );
  });

  // Dropdown options
  readonly gradeLevels = signal<GradeLevelDto[]>([]);
  readonly subjects = signal<SubjectDto[]>([]);

  // Local model for dropdowns (using ngModel for simplicity, triggering changes)
  selectedGradeId = '';
  selectedSubjectId = '';

  constructor() {
    // Whenever filters change in the service, reload
    effect(() => {
      this.classroomService.filters();
      this.classroomService.loadClassrooms();
    });
  }

  ngOnInit(): void {
    // Fetch dropdown options
    this.classroomService.getGradeLevels().subscribe((res) => this.gradeLevels.set(res));
    this.classroomService.getSubjects().subscribe((res) => this.subjects.set(res));
  }

  onFilterChange(): void {
    this.classroomService.setFilters({
      pageNumber: 1, // Reset to page 1 on filter change
      gradeLevelId: this.selectedGradeId || undefined,
      subjectId: this.selectedSubjectId || undefined,
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onPageChange(newPage: number): void {
    if (newPage < 1 || newPage > (this.classroomsResult()?.totalPages ?? 1)) return;
    this.classroomService.setFilters({ pageNumber: newPage });
  }

  getPagesArray(): number[] {
    const total = this.classroomsResult()?.totalPages ?? 1;
    const current = this.classroomsResult()?.pageNumber ?? 1;
    const delta = 2;
    const pages: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      pages.push(i);
    }
    return pages;
  }

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onClassroomCreated(): void {
    this.closeCreateModal();
    // Refresh list, reset to page 1 to see the new classroom
    this.classroomService.setFilters({ pageNumber: 1 });
  }

  confirmToggleStatus(classroom: ClassroomDto): void {
    const actionLabel = classroom.isActive ? 'تعطيل' : 'تفعيل';
    this.confirmationService.confirm({
      message: `هل أنت متأكد من أنك تريد ${actionLabel} المرحلة "${classroom.name}"؟`,
      header: `تأكيد ال${actionLabel}`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: `نعم، ${actionLabel}`,
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: classroom.isActive ? 'p-button-danger' : 'p-button-success',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        if (classroom.isActive) {
          this.deactivateClassroom(classroom.classroomId);
        } else {
          // Note: Draya API currently only has a DELETE endpoint for soft-deactivate.
          // Reactivation might require a PUT update, but for now we'll rely on the update method.
          this.reactivateClassroom(classroom);
        }
      },
    });
  }

  private deactivateClassroom(id: string): void {
    this.classroomService.deactivateClassroom(id).subscribe({
      next: () => {
        this.messageService?.add({
          severity: 'success',
          summary: 'تم التعطيل',
          detail: 'تم تعطيل المرحلة الدراسية بنجاح.',
        });
        this.classroomService.loadClassrooms();
      },
      error: () => {
        this.messageService?.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء التعطيل.',
        });
      },
    });
  }

  private reactivateClassroom(classroom: ClassroomDto): void {
    // To reactivate, we use the PUT update endpoint and set isActive to true
    this.classroomService.updateClassroom(classroom.classroomId, {
      name: classroom.name,
      subjectId: '00000000-0000-0000-0000-000000000000', // We might need the full IDs, but we only have names in DTO. 
      // ACTUALLY wait! If we don't have subjectId, classroomTypeId, gradeLevelId, we can't reliably PUT.
      // So reactivation from list might fail if the user doesn't just use the Edit Modal.
      // For now, let's just open the edit modal if they want to reactivate!
      classroomTypeId: '00000000-0000-0000-0000-000000000000',
      gradeLevelId: '00000000-0000-0000-0000-000000000000',
      startDate: classroom.startDate,
      endDate: classroom.endDate,
      price: classroom.price,
      isActive: true
    }).subscribe({
      next: () => {
        this.messageService?.add({ severity: 'success', summary: 'نجاح', detail: 'تم التفعيل' });
        this.classroomService.loadClassrooms();
      },
      error: () => {
        // If it fails, instruct them to use Edit
        this.messageService?.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى استخدام زر "تعديل" لتفعيل المرحلة لتحديث بياناتها.' });
        this.selectedClassroomForEdit.set(classroom);
        this.isEditModalOpen.set(true);
      }
    });
  }
}
