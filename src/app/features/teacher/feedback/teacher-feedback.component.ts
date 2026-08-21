import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ClassroomService } from '../services/classroom.service';
import { ClassroomDto } from '../../../core/models/classroom.model';
import { ClassroomFeedbackSummaryDto } from '../../../core/models/student-courses.model';
import { DatePipe, NgClass, DecimalPipe } from '@angular/common';

@Component({
  selector: 'draya-teacher-feedback',
  standalone: true,
  imports: [TranslatePipe, DatePipe, NgClass, DecimalPipe],
  templateUrl: './teacher-feedback.component.html',
  styleUrl: './teacher-feedback.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherFeedbackComponent implements OnInit {
  private readonly classroomService = inject(ClassroomService);

  readonly classrooms = signal<ClassroomDto[]>([]);
  readonly selectedClassroom = signal<ClassroomDto | null>(null);
  
  readonly feedback = signal<ClassroomFeedbackSummaryDto | null>(null);
  readonly isLoadingClassrooms = signal<boolean>(true);
  readonly isLoadingFeedback = signal<boolean>(false);

  ngOnInit(): void {
    this.loadClassrooms();
  }

  private loadClassrooms(): void {
    this.isLoadingClassrooms.set(true);
    this.classroomService.getTeacherClassrooms(1, 100).subscribe({
      next: (res) => {
        this.classrooms.set(res.items ?? []);
        this.isLoadingClassrooms.set(false);
      },
      error: () => {
        this.isLoadingClassrooms.set(false);
      },
    });
  }

  selectClassroom(classroom: ClassroomDto): void {
    if (this.selectedClassroom()?.classroomId === classroom.classroomId) {
      return;
    }
    this.selectedClassroom.set(classroom);
    this.loadFeedback(classroom.classroomId);
  }

  private loadFeedback(classroomId: string): void {
    this.isLoadingFeedback.set(true);
    this.classroomService.getClassroomFeedback(classroomId, 1, 100).subscribe({
      next: (res) => {
        this.feedback.set(res);
        this.isLoadingFeedback.set(false);
      },
      error: () => {
        this.isLoadingFeedback.set(false);
      },
    });
  }

  getStars(): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
