// src/app/features/teacher/exams/pending-reviews/pending-reviews.component.ts
import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TeacherAttemptReviewService } from '../../services/teacher-attempt-review.service';
import { PendingReviewClassroomDto } from '../../../../core/models/teacher-attempt-review.model';

/**
 * Full page for GET /teachers/pending-reviews — every attempt across every
 * classroom that needs teacher grading, grouped classroom -> exam -> attempt.
 * Reached from the compact summary card in draya-teacher-sidebar
 * (TeacherPendingReviewsComponent), which only shows a count and links here
 * rather than embedding this whole accordion in the persistent sidebar.
 */
@Component({
  selector: 'draya-teacher-pending-reviews-page',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './pending-reviews.component.html',
  styleUrl: './pending-reviews.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherPendingReviewsPageComponent implements OnInit {
  private readonly attemptReviewService = inject(TeacherAttemptReviewService);
  private readonly router = inject(Router);

  readonly isLoading = signal<boolean>(true);
  readonly classrooms = signal<readonly PendingReviewClassroomDto[]>([]);
  readonly expandedClassroomId = signal<string | null>(null);
  readonly totalPendingCount = signal<number>(0);

  ngOnInit(): void {
    this.attemptReviewService.getPendingReviews().subscribe((list) => {
      this.classrooms.set(list);
      this.isLoading.set(false);

      const total = list.reduce(
        (sum, c) => sum + (c.exams || []).reduce((s, e) => s + (e.pendingReviews?.length || 0), 0),
        0,
      );
      this.totalPendingCount.set(total);

      if (list.length > 0) {
        this.expandedClassroomId.set(list[0].classroomId);
      }
    });
  }

  toggleClassroom(classroomId: string): void {
    this.expandedClassroomId.update((id) => (id === classroomId ? null : classroomId));
  }

  openAttempt(attemptId: string): void {
    this.router.navigate(['/teacher/attempts', attemptId, 'review']);
  }
}
