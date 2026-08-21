import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ClassroomService } from '../../services/classroom.service';
import { SectionService } from '../../services/section.service';
import { ExamGenerationService } from '../../services/exam-generation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ClassroomDto } from '../../../../core/models/classroom.model';
import { ClassroomSectionDto } from '../../../../core/models/section.model';
import { QuestionType, DifficultyLevel, GenerateExamRequest, QuestionRequirement } from '../../../../core/models/exam-generation.model';
import { AuthService } from '../../../../features/auth/services/auth.service';

import { Select } from 'primeng/select';

@Component({
  selector: 'draya-generate-exam',
  standalone: true,
  imports: [ReactiveFormsModule, Select],
  templateUrl: './generate-exam.component.html',
  styleUrl: './generate-exam.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateExamComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly classroomService = inject(ClassroomService);
  private readonly sectionService = inject(SectionService);
  private readonly examGenService = inject(ExamGenerationService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly classrooms = signal<ClassroomDto[]>([]);
  readonly sections = signal<ClassroomSectionDto[]>([]);

  readonly questionTypes: QuestionType[] = ['MCQ', 'Essay', 'TrueFalse', 'FillInTheBlank', 'ShortAnswer'];
  readonly difficultyLevels: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];

  readonly difficultyOptions = [
    { label: 'سهل', value: 'Easy' },
    { label: 'متوسط', value: 'Medium' },
    { label: 'صعب', value: 'Hard' }
  ];

  readonly questionTypeOptions = [
    { label: 'اختيار من متعدد', value: 'MCQ' },
    { label: 'صح و خطأ', value: 'TrueFalse' },
    { label: 'إجابة قصيرة', value: 'ShortAnswer' },
    { label: 'مقال', value: 'Essay' },
    { label: 'أكمل الفراغات', value: 'FillInTheBlank' }
  ];

  readonly form = this.fb.group({
    classroomId: ['', Validators.required],
    sectionId: [{ value: '', disabled: true }, Validators.required],
    topic: ['', [Validators.required, Validators.maxLength(200)]],
    difficultyLevel: ['Medium' as DifficultyLevel, Validators.required],
    durationMinutes: [60, [Validators.required, Validators.min(1)]],
    startDate: ['', Validators.required],
    endDate: [''],
    allowedAttempts: [1, [Validators.required, Validators.min(1)]],
    teacherInstructions: ['', Validators.maxLength(1000)],
    questionRequirements: this.fb.array([this.createQuestionRequirementGroup()]),
  });

  get questionRequirements() {
    return this.form.get('questionRequirements') as FormArray;
  }

  ngOnInit(): void {
    this.loadClassrooms();

    // Listen to classroom changes to load sections
    this.form.get('classroomId')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(classroomId => {
      this.form.get('sectionId')?.reset('');
      if (classroomId) {
        this.form.get('sectionId')?.enable();
        this.loadSections(classroomId);
      } else {
        this.form.get('sectionId')?.disable();
        this.sections.set([]);
      }
    });
  }

  private loadClassrooms(): void {
    // We get max classrooms since dropdown usually doesn't paginate well, or we just rely on first page
    this.classroomService.getTeacherClassrooms(1, 100).subscribe({
      next: (res) => this.classrooms.set(res.items),
      error: () => this.toast.error('فشل في تحميل الفصول الدراسية'),
    });
  }

  private loadSections(classroomId: string): void {
    this.sectionService.getSections(classroomId).subscribe({
      next: (res) => {
        const mappedSections = res.map(s => {
          const hasMaterial = (s.documents && s.documents.length > 0) || (s.videos && s.videos.length > 0);
          return {
            ...s,
            title: hasMaterial ? s.title : `${s.title} (غير متاح - لا يوجد محتوى)`,
            disabled: !hasMaterial
          };
        });
        this.sections.set(mappedSections);
      },
      error: () => this.toast.error('حدث خطأ أثناء تحميل الوحدات'),
    });
  }

  createQuestionRequirementGroup(): FormGroup {
    return this.fb.group({
      type: ['MCQ' as QuestionType, Validators.required],
      count: [5, [Validators.required, Validators.min(1), Validators.max(50)]],
    });
  }

  addQuestionRequirement(): void {
    this.questionRequirements.push(this.createQuestionRequirementGroup());
  }

  removeQuestionRequirement(index: number): void {
    if (this.questionRequirements.length > 1) {
      this.questionRequirements.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.form.getRawValue();
    const payload: Omit<GenerateExamRequest, 'idempotencyKey'> = {
      ...formValue,
      startDate: new Date(formValue.startDate).toISOString(),
      endDate: formValue.endDate ? new Date(formValue.endDate).toISOString() : undefined,
      questionRequirements: formValue.questionRequirements as QuestionRequirement[],
      teacherId: this.authService.currentUser()?.userId || '',
      isPracticeReview: true // Ensure this matches backend requirements
    };

    this.examGenService.generateExam(payload).subscribe({
      next: (res) => {
        this.toast.success('تم إرسال طلب إنشاء الامتحان بنجاح');
        this.isSubmitting.set(false);
        this.router.navigate(['/teacher/exams/generations', res.generationId, 'tracking']);
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'فشل في إنشاء الامتحان');
        this.isSubmitting.set(false);
      },
    });
  }
}
