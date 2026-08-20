import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClassroomService } from '../../services/classroom.service';
import { ClassroomDto } from '../../../../core/models/classroom.model';
import { ClassroomExamsComponent } from '../../classrooms/classroom-detail/components/classroom-exams/classroom-exams.component';

@Component({
  selector: 'draya-teacher-exams',
  standalone: true,
  imports: [CommonModule, ClassroomExamsComponent, RouterLink],
  templateUrl: './teacher-exams.component.html',
  styleUrl: './teacher-exams.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class TeacherExamsComponent implements OnInit {
  private readonly classroomService = inject(ClassroomService);
  private readonly destroyRef = inject(DestroyRef);

  readonly classrooms = signal<ClassroomDto[]>([]);
  readonly isLoadingClassrooms = signal<boolean>(true);
  readonly selectedClassroomId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTeacherClassrooms();
  }

  loadTeacherClassrooms(): void {
    this.isLoadingClassrooms.set(true);
    this.classroomService
      .getTeacherClassrooms(1, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const items = res?.items || [];
          this.classrooms.set(items);
          if (items.length > 0) {
            this.selectedClassroomId.set(items[0].classroomId);
          }
          this.isLoadingClassrooms.set(false);
        },
        error: (err) => {
          console.error('Failed to load classrooms', err);
          this.isLoadingClassrooms.set(false);
        },
      });
  }

  selectClassroom(id: string): void {
    this.selectedClassroomId.set(id);
  }
}
