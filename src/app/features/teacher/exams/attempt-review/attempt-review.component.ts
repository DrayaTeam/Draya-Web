// src/app/features/teacher/exams/attempt-review/attempt-review.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherAttemptReviewService } from '../../services/teacher-attempt-review.service';
import { AttemptResultResponseDto } from '../../../../core/models/student-exam-taking.model';
import { formatExamScoreDisplay } from '../../../../core/services/student-exams.service';

@Component({
  selector: 'draya-attempt-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attempt-review.component.html',
  styleUrl: './attempt-review.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttemptReviewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly attemptReviewService = inject(TeacherAttemptReviewService);

  readonly attemptId = signal<string | null>(null);
  readonly result = signal<AttemptResultResponseDto | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  /** answerId -> the value currently typed into that answer's override input. */
  readonly draftScores = signal<Record<string, number | undefined>>({});
  /** answerId of the override currently being submitted, if any. */
  readonly submittingAnswerId = signal<string | null>(null);

  readonly needsReviewCount = computed(
    () =>
      (this.result()?.answers || []).filter(
        (a) => a.gradingResult?.needsTeacherReview && !a.gradingResult?.isFinalized,
      ).length,
  );

  readonly scorePercentage = computed(() => {
    const res = this.result();
    if (!res || res.finalScore === undefined || res.finalScore === null) return 0;
    const total = res.maxScore || res.answers?.length || 0;
    return formatExamScoreDisplay(res.finalScore, undefined, total).percent ?? 0;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('attemptId');
    if (!id) {
      this.error.set('لم يتم العثور على معرف المحاولة.');
      this.isLoading.set(false);
      return;
    }
    this.attemptId.set(id);
    this.loadResults(id);
  }

  private loadResults(attemptId: string): void {
    this.isLoading.set(true);
    this.attemptReviewService.getAttemptResults(attemptId).subscribe((res) => {
      this.isLoading.set(false);
      if (!res) {
        this.error.set('تعذر تحميل نتيجة هذه المحاولة.');
        return;
      }
      this.error.set(null);
      this.result.set(res);

      const drafts: Record<string, number> = {};
      for (const ans of res.answers || []) {
        if (ans.gradingResult) {
          drafts[ans.answerId] = ans.gradingResult.score;
        }
      }
      this.draftScores.set(drafts);
    });
  }

  onScoreInput(answerId: string, value: string): void {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    this.draftScores.update((d) => ({ ...d, [answerId]: parsed }));
  }

  onSubmitOverride(answerId: string, maxScore: number): void {
    const attemptId = this.attemptId();
    if (!attemptId) return;

    let newScore = this.draftScores()[answerId];
    if (newScore === undefined || Number.isNaN(newScore)) return;
    newScore = Math.max(0, Math.min(maxScore, newScore));

    this.submittingAnswerId.set(answerId);
    this.attemptReviewService.overrideAnswerScore(attemptId, answerId, newScore).subscribe((ok) => {
      this.submittingAnswerId.set(null);
      if (ok) {
        // The backend recalculates the attempt score, weakness history, and AI
        // cache invalidation atomically — refetch rather than compute locally.
        this.loadResults(attemptId);
      } else {
        this.error.set('تعذر حفظ الدرجة المعدّلة، يرجى المحاولة مرة أخرى.');
      }
    });
  }

  onBack(): void {
    const examId = this.result()?.examId;
    if (examId) {
      this.router.navigate(['/teacher/exams', examId, 'attempts']);
    } else {
      this.location.back();
    }
  }
}
