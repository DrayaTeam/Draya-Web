import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TeacherExamService } from '../../services/teacher-exam.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  TeacherExamDto,
  ExamQuestionDto,
  GeneratedQuestionDto,
} from '../../../../core/models/teacher-exam.model';
import { RefineQuestionModalComponent } from './components/refine-question-modal/refine-question-modal.component';
import { EditQuestionModalComponent } from './components/edit-question-modal/edit-question-modal.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'draya-review-exam',
  standalone: true,
  imports: [DatePipe, RefineQuestionModalComponent, EditQuestionModalComponent, ModalComponent],
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

  readonly isEditModalOpen = signal(false);
  readonly selectedQuestionForEdit = signal<ExamQuestionDto | null>(null);

  readonly isDeleteModalOpen = signal(false);
  readonly questionIdToDelete = signal<string | null>(null);

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
      },
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

  onQuestionRefined(questionResult: unknown): void {
    const updatedQuestion = questionResult as GeneratedQuestionDto;
    const originalQuestion = this.selectedQuestionForRefine();
    const originalQuestionId = originalQuestion?.id;
    const originalQuestionOrder = originalQuestion?.order ?? 0;
    this.closeRefineModal();

    const currentExam = this.exam();
    if (currentExam && originalQuestionId && updatedQuestion) {
      this.isLoading.set(true);

      const payload = {
        text: updatedQuestion.text,
        type: updatedQuestion.type,
        difficulty: updatedQuestion.difficulty,
        rubric: updatedQuestion.rubric,
        options: updatedQuestion.options?.map((opt) => ({
          text: opt.text || '',
          isCorrect: !!opt.isCorrect,
        })),
      };

      this.examService.updateQuestion(currentExam.id, originalQuestionId, payload).subscribe({
        next: () => {
          // Map GeneratedQuestionDto to ExamQuestionDto format for local state update
          const mappedQuestion: ExamQuestionDto = {
            id: originalQuestionId,
            text: updatedQuestion.text,
            type: updatedQuestion.type,
            difficultyLevel: updatedQuestion.difficulty,
            rubric: updatedQuestion.rubric,
            correctAnswer: updatedQuestion.acceptedAnswers
              ? updatedQuestion.acceptedAnswers[0]
              : undefined,
            order: originalQuestionOrder,
            options: updatedQuestion.options?.map(
              (opt: { text?: string; isCorrect?: boolean }) => ({
                text: opt.text || '',
                isCorrect: !!opt.isCorrect,
              }),
            ),
          };

          const updatedQuestions = (currentExam.questions || []).map((q) =>
            q.id === originalQuestionId ? mappedQuestion : q,
          );
          this.exam.set({ ...currentExam, questions: updatedQuestions });
          this.toast.success('تم حفظ التعديل بنجاح');
          this.isLoading.set(false);
        },
        error: () => {
          this.toast.error('حدث خطأ أثناء حفظ التعديل');
          this.isLoading.set(false);
        },
      });
    }
  }

  openAddQuestionModal(): void {
    this.selectedQuestionForEdit.set(null);
    this.isEditModalOpen.set(true);
  }

  openEditQuestionModal(question: ExamQuestionDto): void {
    this.selectedQuestionForEdit.set(question);
    this.isEditModalOpen.set(true);
  }

  closeEditQuestionModal(): void {
    this.isEditModalOpen.set(false);
    this.selectedQuestionForEdit.set(null);
  }

  onQuestionSaved(question: ExamQuestionDto): void {
    const currentExam = this.exam();
    if (currentExam) {
      const questions = currentExam.questions || [];
      const exists = questions.find((q) => q.id === question.id);
      if (exists) {
        this.exam.set({
          ...currentExam,
          questions: questions.map((q) => (q.id === question.id ? question : q)),
        });
      } else {
        this.exam.set({ ...currentExam, questions: [...questions, question] });
      }
    }
  }

  confirmDeleteQuestion(questionId: string): void {
    this.questionIdToDelete.set(questionId);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.questionIdToDelete.set(null);
  }

  executeDeleteQuestion(): void {
    const questionId = this.questionIdToDelete();
    const currentExam = this.exam();
    
    if (questionId && currentExam) {
      this.closeDeleteModal();
      this.isLoading.set(true);
      
      this.examService.deleteQuestion(currentExam.id, questionId).subscribe({
        next: () => {
          const questions = currentExam.questions || [];
          this.exam.set({
            ...currentExam,
            questions: questions.filter((q) => q.id !== questionId),
          });
          this.toast.success('تم حذف السؤال بنجاح');
          this.isLoading.set(false);
        },
        error: () => {
          this.toast.error('حدث خطأ أثناء حذف السؤال');
          this.isLoading.set(false);
        },
      });
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
