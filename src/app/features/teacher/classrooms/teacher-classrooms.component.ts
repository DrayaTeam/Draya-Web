// src/app/features/teacher/classrooms/teacher-classrooms.component.ts
import { Component, ChangeDetectionStrategy, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ClassroomService } from '../services/classroom.service';
import { GradeLevelDto, SubjectDto } from '../../../core/models/classroom.model';
import { CreateClassroomModalComponent } from './components/create-classroom-modal/create-classroom-modal.component';

@Component({
  selector: 'draya-teacher-classrooms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    TranslatePipe,
    CreateClassroomModalComponent
  ],
  templateUrl: './teacher-classrooms.component.html',
  styleUrl: './teacher-classrooms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' }
})
export class TeacherClassroomsComponent implements OnInit {
  private readonly classroomService = inject(ClassroomService);

  readonly isCreateModalOpen = signal<boolean>(false);

  // Expose service state to template
  readonly classroomsResult = this.classroomService.classroomsResult;
  readonly isLoading = this.classroomService.isLoading;
  readonly filters = this.classroomService.filters;

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
    this.classroomService.getGradeLevels().subscribe(res => this.gradeLevels.set(res));
    this.classroomService.getSubjects().subscribe(res => this.subjects.set(res));
  }

  onFilterChange(): void {
    this.classroomService.setFilters({
      pageNumber: 1, // Reset to page 1 on filter change
      gradeLevelId: this.selectedGradeId || undefined,
      subjectId: this.selectedSubjectId || undefined
    });
  }

  onPageChange(newPage: number): void {
    if (newPage < 1 || newPage > (this.classroomsResult()?.totalPages ?? 1)) return;
    this.classroomService.setFilters({ pageNumber: newPage });
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
}
