import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassroomService } from '../../services/classroom.service';
import { ClassroomDto } from '../../../../core/models/classroom.model';
import { ClassroomStudentsComponent } from '../../classrooms/classroom-detail/components/classroom-students/classroom-students.component';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'draya-teacher-students',
  standalone: true,
  imports: [CommonModule, ClassroomStudentsComponent, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './teacher-students.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherStudentsComponent {
  private readonly classroomService = inject(ClassroomService);

  readonly classrooms = signal<ClassroomDto[]>([]);
  readonly selectedClassroomId = signal<string | null>(null);
  readonly isLoadingClassrooms = signal<boolean>(true);

  constructor() {
    this.loadClassrooms();
  }

  private loadClassrooms(): void {
    this.isLoadingClassrooms.set(true);
    this.classroomService.getTeacherClassrooms(1, 50).subscribe({
      next: (res) => {
        const sorted = res.items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.classrooms.set(sorted);
        
        // Auto-select first classroom
        if (sorted.length > 0) {
          this.selectedClassroomId.set(sorted[0].classroomId);
        }
        this.isLoadingClassrooms.set(false);
      },
      error: (err) => {
        console.error('Failed to load classrooms for students hub', err);
        this.isLoadingClassrooms.set(false);
      }
    });
  }

  selectClassroom(id: string): void {
    this.selectedClassroomId.set(id);
  }
}
