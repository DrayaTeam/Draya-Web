import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TeacherExamService } from '../../services/teacher-exam.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TeacherExamDto, ExamQuestionDto } from '../../../../core/models/teacher-exam.model';
import { RefineQuestionModalComponent } from './components/refine-question-modal/refine-question-modal.component';

@Component({
  selector: 'draya-review-exam',
  standalone: true,
  imports: [DatePipe, RefineQuestionModalComponent],
  templateUrl: './review-exam.component.html',
  styleUrl: './review-exam.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewExamComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examService = inject(TeacherExamService);
  private readonly toast = inject(ToastService);

  readonly exam = signal<TeacherExamDto | null>(null);
  readonly isLoading = signal<boolean>(true);

  // Modal State
  readonly isRefineModalOpen = signal(false);
  readonly selectedQuestionForRefine = signal<ExamQuestionDto | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadExam(id);
    } else {
      this.router.navigate(['/teacher/exams/generate']);
    }
  }

  private loadExam(id: string): void {
    this.isLoading.set(true);
    this.examService.getExam(id).subscribe({
      next: (res) => {
        this.exam.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('فشل في تحميل الامتحان');
        this.isLoading.set(false);
      }
    });
  }

  openRefineModal(question: ExamQuestionDto): void {
    this.selectedQuestionForRefine.set(question);
    this.isRefineModalOpen.set(true);
  }

  closeRefineModal(): void {
    this.isRefineModalOpen.set(false);
    this.selectedQuestionForRefine.set(null);
  }

  onQuestionRefined(updatedQuestion: any): void {
    const originalQuestion = this.selectedQuestionForRefine();
    const originalQuestionId = originalQuestion?.id;
    const originalQuestionOrder = originalQuestion?.order ?? 0;
    this.closeRefineModal();
    
    const currentExam = this.exam();
    if (currentExam && originalQuestionId) {
      // Map GeneratedQuestionDto to ExamQuestionDto format
      const mappedQuestion: ExamQuestionDto = {
        id: originalQuestionId, // Preserve the ID so subsequent refinements work!
        text: updatedQuestion.text,
        type: updatedQuestion.type,
        difficultyLevel: updatedQuestion.difficulty,
        rubric: updatedQuestion.rubric,
        correctAnswer: updatedQuestion.acceptedAnswers ? updatedQuestion.acceptedAnswers[0] : undefined,
        order: originalQuestionOrder, // Preserve the order
        options: updatedQuestion.options?.map((opt: any, index: number) => ({
          text: opt.text,
          isCorrect: index === updatedQuestion.correctAnswerIndex
        }))
      } as ExamQuestionDto;

      const updatedQuestions = (currentExam.questions || []).map(q => 
        q.id === originalQuestionId ? mappedQuestion : q
      );
      this.exam.set({ ...currentExam, questions: updatedQuestions });
      this.toast.success('تم تحسين السؤال بنجاح');
    }
  }

  finishReview(): void {
    const currentExam = this.exam();
    if (currentExam) {
      this.router.navigate(['/teacher/classrooms', currentExam.classroomId]);
    } else {
      this.router.navigate(['/teacher/dashboard']);
    }
  }
}
