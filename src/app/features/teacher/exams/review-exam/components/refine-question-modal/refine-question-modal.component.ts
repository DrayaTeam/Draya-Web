import { Component, ChangeDetectionStrategy, inject, signal, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExamQuestionDto } from '../../../../../../core/models/teacher-exam.model';
import { TeacherExamService } from '../../../../services/teacher-exam.service';
import { ToastService } from '../../../../../../core/services/toast.service';

@Component({
  selector: 'draya-refine-question-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './refine-question-modal.component.html',
  styleUrl: './refine-question-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefineQuestionModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly examService = inject(TeacherExamService);
  private readonly toast = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly examId = input.required<string>();
  readonly question = input<ExamQuestionDto | null>(null);

  readonly modalClosed = output<void>();
  readonly questionRefined = output<unknown>();

  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    instruction: ['', [Validators.required, Validators.maxLength(500)]],
  });

  closeModal(): void {
    this.form.reset();
    this.modalClosed.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const currentQuestion = this.question();
    if (!currentQuestion) return;

    this.isSubmitting.set(true);
    const payload = this.form.getRawValue();

    this.examService.refineQuestion(this.examId(), currentQuestion.id, payload).subscribe({
      next: (generatedQuestion) => {
        this.isSubmitting.set(false);
        this.form.reset();
        // Emitting the generated question will trigger the UI replacement in the parent
        this.questionRefined.emit(generatedQuestion);
      },
      error: (err) => {
        console.error('=== BACKEND ERROR DETAILS ===', err);
        console.error('RAW ERROR BODY:', err?.error);
        const backendErrorMsg =
          err?.error?.message || err?.error?.title || err?.message || 'فشل التحسين (Bad Request).';
        this.toast.error(backendErrorMsg);
        this.isSubmitting.set(false);
      },
    });
  }
}
