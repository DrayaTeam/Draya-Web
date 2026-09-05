import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  output,
  effect,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import {
  ExamQuestionDto,
  UpdateQuestionRequest,
} from '../../../../../../core/models/teacher-exam.model';
import { QuestionType } from '../../../../../../core/models/exam-generation.model';
import { TeacherExamService } from '../../../../services/teacher-exam.service';
import { ToastService } from '../../../../../../core/services/toast.service';

@Component({
  selector: 'draya-edit-question-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-question-modal.component.html',
  styleUrl: './edit-question-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditQuestionModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly examService = inject(TeacherExamService);
  private readonly toast = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly examId = input.required<string>();
  readonly question = input<ExamQuestionDto | null>(null);

  readonly modalClosed = output<void>();
  readonly saved = output<ExamQuestionDto>();

  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    text: ['', [Validators.required]],
    type: ['MultipleChoice', [Validators.required]],
    difficulty: ['Medium'],
    rubric: [''],
    options: this.fb.array([]),
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const q = this.question();
        this.options.clear();
        if (q) {
          this.form.patchValue({
            text: q.text,
            type: q.type,
            difficulty: q.difficultyLevel || 'Medium',
            rubric: q.rubric || '',
          });
          if (q.options && q.options.length > 0) {
            q.options.forEach((opt) => this.addOption(opt.text, opt.isCorrect));
          } else if (q.type === 'MultipleChoice') {
            this.addOption('', true);
            this.addOption('', false);
          }
        } else {
          this.form.reset({ type: 'MultipleChoice', difficulty: 'Medium' });
          this.addOption('', true);
          this.addOption('', false);
        }
      }
    });
  }

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  addOption(text = '', isCorrect = false): void {
    this.options.push(
      this.fb.group({
        text: [text, Validators.required],
        isCorrect: [isCorrect],
      }),
    );
  }

  removeOption(index: number): void {
    this.options.removeAt(index);
  }

  setCorrectOption(index: number): void {
    for (let i = 0; i < this.options.length; i++) {
      this.options
        .at(i)
        .get('isCorrect')
        ?.setValue(i === index);
    }
  }

  closeModal(): void {
    this.form.reset();
    this.modalClosed.emit();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: UpdateQuestionRequest = {
      text: this.form.value.text || '',
      type: this.form.value.type || undefined,
      difficulty: this.form.value.difficulty || undefined,
      rubric: this.form.value.rubric || undefined,
      options: ['MultipleChoice', 'TrueFalse'].includes(this.form.value.type!)
        ? (this.form.value.options as { text: string; isCorrect: boolean }[])
        : undefined,
    };

    const q = this.question();
    if (q) {
      this.examService.updateQuestion(this.examId(), q.id, payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.toast.success('تم التحديث بنجاح');
          this.saved.emit({
            ...q,
            ...payload,
            type: (payload.type as QuestionType) || q.type,
          });
          this.closeModal();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toast.error('حدث خطأ', 'لم نتمكن من حفظ التعديلات');
        },
      });
    } else {
      this.examService.addQuestion(this.examId(), payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.toast.success('تمت الإضافة بنجاح');
          this.saved.emit(res);
          this.closeModal();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.toast.error('حدث خطأ', 'لم نتمكن من إضافة السؤال');
        },
      });
    }
  }
}
