import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  signal,
  computed,
  effect,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, Subject, takeUntil } from 'rxjs';

import { TeacherModalComponent } from '../../../../components/teacher-modal/teacher-modal.component';
import { TeacherReportsService } from '../../../../services/teacher-reports.service';
import { StudentRosterItemDto } from '../../../../../../core/models/student-roster.model';
import { StudentAnalyticsDto } from '../../../../../../core/models/teacher-reports.model';
import { normalizeScoreToPercent } from '../../../../../../core/services/student-reports.service';

@Component({
  selector: 'draya-student-details-modal',
  standalone: true,
  imports: [CommonModule, TeacherModalComponent],
  templateUrl: './student-details-modal.component.html',
  styleUrl: './student-details-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDetailsModalComponent implements OnDestroy {
  readonly isOpen = input.required<boolean>();
  readonly student = input.required<StudentRosterItemDto | null>();
  readonly modalClosed = output<void>();

  private readonly reportsService = inject(TeacherReportsService);
  private readonly destroy$ = new Subject<void>();

  readonly isLoading = signal<boolean>(false);
  readonly analytics = signal<StudentAnalyticsDto | null>(null);
  readonly error = signal<string | null>(null);

  readonly normalizedOverallAverage = computed(() => {
    const raw = this.analytics()?.overallAverage;
    return raw === undefined || raw === null ? 0 : normalizeScoreToPercent(raw);
  });

  readonly normalizedHighestScore = computed(() => {
    const raw = this.analytics()?.highestScore;
    return raw === undefined || raw === null ? 0 : normalizeScoreToPercent(raw);
  });

  constructor() {
    effect(() => {
      const currentStudent = this.student();
      const open = this.isOpen();

      if (open && currentStudent?.studentId) {
        this.fetchAnalytics(currentStudent.studentId);
      } else {
        this.analytics.set(null);
        this.error.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchAnalytics(studentId: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.analytics.set(null);

    this.reportsService
      .getStudentAnalytics(studentId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (data) => {
          this.analytics.set(data);
        },
        error: (err) => {
          console.error('Failed to fetch student analytics', err);
          this.error.set('حدث خطأ أثناء جلب بيانات الطالب.');
        },
      });
  }
}
