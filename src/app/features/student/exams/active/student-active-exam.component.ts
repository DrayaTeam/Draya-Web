// src/app/features/student/exams/active/student-active-exam.component.ts

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StudentExamTakingService } from '../../../../core/services/student-exam-taking.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ExamQuestionCardComponent } from '../components/exam-question-card/exam-question-card.component';
import { ExamQuestionMapComponent } from '../components/exam-question-map/exam-question-map.component';
import { ExamSecurityWarningComponent } from '../components/exam-security-warning/exam-security-warning.component';

@Component({
  selector: 'app-student-active-exam',
  standalone: true,
  imports: [
    CommonModule,
    ExamQuestionCardComponent,
    ExamQuestionMapComponent,
    ExamSecurityWarningComponent,
  ],
  templateUrl: './student-active-exam.component.html',
  styleUrl: './student-active-exam.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentActiveExamComponent {
  protected readonly examService = inject(StudentExamTakingService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  onSelectOption(event: { questionId: string; optionId: string }): void {
    this.examService.selectOption(event.questionId, event.optionId);
  }

  onToggleFlag(questionId: string): void {
    this.examService.toggleFlagQuestion(questionId);
    this.toastService.info('تحديث مراجعة السؤال', 'تم تغيير حالة مراجعة السؤال');
  }

  onGoToQuestion(index: number): void {
    this.examService.goToQuestion(index);
  }

  onNextQuestion(): void {
    this.examService.nextQuestion();
  }

  onPrevQuestion(): void {
    this.examService.prevQuestion();
  }

  onSubmitExam(): void {
    this.examService.submitExam();
    this.toastService.success(
      'تم تسليم الامتحان بنجاح',
      'جاري استخراج تقرير تحليل النتيجة والمهارات...',
    );
    this.router.navigate(['/student/exams/exam-1/result']);
  }
}
