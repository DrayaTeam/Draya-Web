// src/app/features/teacher/classrooms/components/create-classroom-modal/create-classroom-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { ClassroomService } from '../../../services/classroom.service';
import { ClassroomTypeDto, GradeLevelDto, SubjectDto, CreateClassroomRequest } from '../../../../../core/models/classroom.model';
import { ApiError } from '../../../../../core/models/api-error.model';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { ToastService } from '../../../../../core/services/toast.service';

/** Custom validator to ensure endDate is after startDate */
function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const start = control.get('startDate')?.value;
  const end = control.get('endDate')?.value;
  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (endDate <= startDate) {
      return { dateRangeInvalid: true };
    }
  }
  return null;
}

@Component({
  selector: 'draya-create-classroom-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-classroom-modal.component.html',
  styleUrl: './create-classroom-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateClassroomModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly classroomService = inject(ClassroomService);
  private readonly toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly modalClosed = output<void>();
  readonly created = output<void>();

  form!: FormGroup;
  
  // Lookup Data Signals
  readonly subjects = signal<SubjectDto[]>([]);
  readonly classroomTypes = signal<ClassroomTypeDto[]>([]);
  readonly gradeLevels = signal<GradeLevelDto[]>([]);
  
  // State Signals
  readonly isSubmitting = signal<boolean>(false);
  readonly isCreatingSubject = signal<boolean>(false);
  readonly isCreatingSubjectLoading = signal<boolean>(false);
  readonly quotaError = signal<string | null>(null);

  // Standalone control for new subject
  readonly newSubjectControl = new FormControl('', [Validators.required, Validators.minLength(2)]);

  constructor() {
    // Re-fetch data when modal opens just to be safe, or clear errors
    effect(() => {
      if (this.isOpen()) {
        this.quotaError.set(null);
        if (this.form) {
          this.form.reset({ price: 0 }); // Default price to 0
        }
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadLookupData();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      subjectId: ['', Validators.required],
      classroomTypeId: ['', Validators.required],
      gradeLevelId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
    }, { validators: dateRangeValidator });
  }

  private loadLookupData(): void {
    this.classroomService.getSubjects().subscribe({
      next: (data) => this.subjects.set(data),
      error: (err) => console.error('Failed to load subjects', err)
    });
    this.classroomService.getClassroomTypes().subscribe({
      next: (data) => this.classroomTypes.set(data),
      error: (err) => console.error('Failed to load types', err)
    });
    this.classroomService.getGradeLevels().subscribe({
      next: (data) => this.gradeLevels.set(data),
      error: (err) => console.error('Failed to load grades', err)
    });
  }

  toggleNewSubjectMode(): void {
    this.isCreatingSubject.set(!this.isCreatingSubject());
    this.newSubjectControl.reset();
  }

  createNewSubject(): void {
    if (this.newSubjectControl.invalid) return;

    const subjectName = this.newSubjectControl.value!;
    this.isCreatingSubjectLoading.set(true);

    this.classroomService.createSubject(subjectName).pipe(
      finalize(() => this.isCreatingSubjectLoading.set(false))
    ).subscribe({
      next: (newSubject) => {
        this.subjects.update(subs => [...subs, newSubject]);
        this.form.patchValue({ subjectId: newSubject.id });
        this.isCreatingSubject.set(false);
        this.toastService.success('نجاح', 'تمت إضافة المادة الجديدة بنجاح');
      },
      error: (err) => {
        console.error('Failed to create subject', err);
        this.toastService.error('خطأ', 'فشل في إضافة المادة، يرجى المحاولة مرة أخرى');
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.quotaError.set(null);

    const formValue = this.form.value;
    
    // Ensure ISO strings for dates
    const payload: CreateClassroomRequest = {
      subjectId: formValue.subjectId,
      name: formValue.name,
      classroomTypeId: formValue.classroomTypeId,
      gradeLevelId: formValue.gradeLevelId,
      startDate: new Date(formValue.startDate).toISOString(),
      endDate: new Date(formValue.endDate).toISOString(),
      price: Number(formValue.price)
    };

    this.classroomService.createClassroom(payload).pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: () => {
        this.toastService.success('نجاح', 'تم إنشاء الفصل الدراسي بنجاح!');
        this.created.emit();
        this.close();
      },
      error: (errorRes: HttpErrorResponse) => {
        const responseBody = errorRes.error as { error: ApiError };
        const apiError = responseBody?.error;

        // Handle confirmed backend quirk: 422 Quota Exceeded
        if (errorRes.status === 422) {
          if (apiError && apiError.code === 'QUOTA_EXCEEDED') {
            this.quotaError.set('لقد استنفدت الحد المسموح به من الفصول. يرجى شحن رصيدك أو ترقية باقتك للاستمرار.');
            return;
          }
        }
        
        // Generic fallback error
        const msg = apiError?.message || 'حدث خطأ أثناء إنشاء الفصل. يرجى المحاولة مرة أخرى.';
        this.toastService.error('خطأ', msg);
      }
    });
  }

  close(): void {
    this.quotaError.set(null);
    this.form.reset({ price: 0 });
    this.isCreatingSubject.set(false);
    this.modalClosed.emit();
  }
}
