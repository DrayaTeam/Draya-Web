import { Component, ChangeDetectionStrategy, input, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassroomService } from '../../../services/classroom.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'draya-classroom-student-count',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading()) {
      <span class="opacity-50">...</span>
    } @else {
      <span>{{ count() }}</span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassroomStudentCountComponent {
  readonly classroomId = input.required<string>();
  readonly fallbackCount = input<number>(0);
  
  private readonly classroomService = inject(ClassroomService);
  
  readonly count = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  constructor() {
    effect(() => {
      const id = this.classroomId();
      if (id) {
        this.fetchCount(id);
      }
    });
  }

  private fetchCount(id: string): void {
    this.isLoading.set(true);
    // Request just 1 item to minimize payload size, we only care about totalCount
    this.classroomService.getClassroomStudents(id, 1, 1).pipe(
      catchError(() => {
        // Fallback to the DTO count if the request fails
        this.count.set(this.fallbackCount());
        return of(null);
      })
    ).subscribe(res => {
      if (res) {
        this.count.set(res.totalCount);
      }
      this.isLoading.set(false);
    });
  }
}
