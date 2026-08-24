// src/app/features/teacher/dashboard/components/teacher-pending-reviews/teacher-pending-reviews.component.ts
import { Component, ChangeDetectionStrategy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TeacherAttemptReviewService } from '../../../services/teacher-attempt-review.service';

/**
 * Compact sidebar summary card for GET /teachers/pending-reviews — shows only
 * a title and how many attempts across all classrooms need grading. The full
 * classroom -> exam -> attempt breakdown lives on its own page
 * (TeacherPendingReviewsPageComponent, /teacher/pending-reviews), which this
 * card always links to; it does not render or expand the list itself.
 */
@Component({
  selector: 'draya-teacher-pending-reviews',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './teacher-pending-reviews.component.html',
  styleUrl: './teacher-pending-reviews.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherPendingReviewsComponent implements OnInit {
  private readonly attemptReviewService = inject(TeacherAttemptReviewService);

  readonly isLoading = signal<boolean>(true);
  readonly totalPendingCount = signal<number>(0);

  ngOnInit(): void {
    this.attemptReviewService.getPendingReviews().subscribe((list) => {
      this.isLoading.set(false);
      const total = list.reduce(
        (sum, c) => sum + (c.exams || []).reduce((s, e) => s + (e.pendingReviews?.length || 0), 0),
        0,
      );
      this.totalPendingCount.set(total);
    });
  }
}
