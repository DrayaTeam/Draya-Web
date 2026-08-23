// src/app/features/teacher/dashboard/components/teacher-pending-reviews/teacher-pending-reviews.component.ts
import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TeacherAttemptReviewService } from '../../../services/teacher-attempt-review.service';
import { PendingReviewClassroomDto } from '../../../../../core/models/teacher-attempt-review.model';

/**
 * Dashboard widget for GET /teachers/pending-reviews — every attempt across
 * every classroom that the AI flagged for teacher grading. Distinct from
 * TeacherAttentionAlertsComponent, which surfaces generic at-risk-student
 * alerts unrelated to grading. Rendered as a classroom -> exam -> attempt
 * accordion per the backend hand-off doc's suggested layout.
 */
@Component({
  selector: 'draya-teacher-pending-reviews',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './teacher-pending-reviews.component.html',
  styleUrl: './teacher-pending-reviews.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherPendingReviewsComponent implements OnInit {
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
