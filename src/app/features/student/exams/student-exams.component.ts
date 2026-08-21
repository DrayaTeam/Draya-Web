import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentExamsService } from '../../../core/services/student-exams.service';
import { ExamCardComponent } from './components/exam-card/exam-card.component';
import { StudentExamItem, ExamStatusType } from '../../../core/models/student-exam.model';
import { ToastService } from '../../../core/services/toast.service';
import { DrayaEmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'draya-student-exams',
  standalone: true,
  imports: [ExamCardComponent, DrayaEmptyStateComponent],
  templateUrl: './student-exams.component.html',
  styleUrl: './student-exams.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentExamsComponent implements OnInit {
  protected readonly examsService = inject(StudentExamsService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly headerInfo = this.examsService.headerInfo;
  readonly exams = this.examsService.filteredExams;
  readonly selectedFilter = this.examsService.selectedFilter;
  readonly searchQuery = this.examsService.searchQuery;

  ngOnInit(): void {
    this.examsService.loadExams();
  }

  setFilter(filter: 'all' | ExamStatusType): void {
    this.examsService.selectedFilter.set(filter);
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.examsService.searchQuery.set(input?.value || '');
  }

  onStartExam(exam: StudentExamItem): void {
    this.toastService.success(
      'بدء الامتحان',
      `جارٍ تحضير بيئة اختبار ${exam.title}... بالتوفيق! 🚀`,
    );
    this.router.navigate(['/student/exams', exam.id, 'take']);
  }

  onViewResults(exam: StudentExamItem): void {
    this.toastService.info(
      'تقرير النتيجة والتصحيح',
      `فتح تقرير الإجابات التفصيلي لاختبار ${exam.title}...`,
    );
    this.router.navigate(['/student/exams', exam.id, 'result']);
  }
}
