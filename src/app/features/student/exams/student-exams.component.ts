import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { StudentExamsService } from '../../../core/services/student-exams.service';
import { ExamCardComponent } from './components/exam-card/exam-card.component';
import { StudentExamItem } from '../../../core/models/student-exam.model';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'draya-student-exams',
  standalone: true,
  imports: [ExamCardComponent],
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

  ngOnInit(): void {
    this.examsService.loadExams();
  }

  setFilter(filter: 'all' | 'available' | 'scheduled' | 'completed'): void {
    this.examsService.selectedFilter.set(filter);
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
