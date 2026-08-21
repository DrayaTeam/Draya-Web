// src/app/features/teacher/channel/teacher-channel.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClassroomService } from '../services/classroom.service';
import { ClassroomDto } from '../../../core/models/classroom.model';
import { ClassroomQaComponent } from '../classrooms/classroom-detail/components/classroom-qa/classroom-qa.component';

@Component({
  selector: 'draya-teacher-channel',
  standalone: true,
  imports: [CommonModule, ClassroomQaComponent],
  templateUrl: './teacher-channel.component.html',
  styleUrl: './teacher-channel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
})
export class TeacherChannelComponent implements OnInit {
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
          console.error('Failed to load teacher classrooms', err);
          this.isLoadingClassrooms.set(false);
        },
      });
  }

  selectClassroom(id: string): void {
    this.selectedClassroomId.set(id);
  }
}
