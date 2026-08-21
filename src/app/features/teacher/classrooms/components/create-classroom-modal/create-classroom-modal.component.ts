// src/app/features/teacher/classrooms/components/create-classroom-modal/create-classroom-modal.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  OnInit,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeacherModalComponent } from '../../../components/teacher-modal/teacher-modal.component';
import { SharedModule } from 'primeng/api';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ClassroomService } from '../../../services/classroom.service';
import {
  ClassroomTypeDto,
  GradeLevelDto,
  SubjectDto,
  CreateClassroomRequest,
} from '../../../../../core/models/classroom.model';
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
  imports: [CommonModule, ReactiveFormsModule, TeacherModalComponent, SharedModule],
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
  readonly selectedImage = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);

  // Standalone control for new subject
  readonly newSubjectControl = new FormControl('', [Validators.required, Validators.minLength(2)]);

  constructor() {
    // Re-fetch data when modal opens just to be safe, or clear errors
    effect(() => {
      if (this.isOpen()) {
        this.quotaError.set(null);
        this.selectedImage.set(null);
        this.imagePreview.set(null);
        if (this.form) {
          this.form.reset({ price: 0 });
    this.selectedImage.set(null);
    this.imagePreview.set(null); // Default price to 0
        }
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadLookupData();
  }

  private initForm(): void {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        subjectId: ['', Validators.required],
        classroomTypeId: [''],
        gradeLevelId: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        price: [0, [Validators.required, Validators.min(0)]],
      },
      { validators: dateRangeValidator },
    );
  }

  private loadLookupData(): void {
    this.classroomService.getSubjects().subscribe({
      next: (data) => this.subjects.set(data),
      error: (err) => console.error('Failed to load subjects', err),
    });
    this.classroomService.getClassroomTypes().subscribe({
      next: (data) => {
        this.classroomTypes.set(data);
        if (data.length > 0 && !this.form.get('classroomTypeId')?.value) {
          this.form.patchValue({ classroomTypeId: data[0].id });
        }
      },
      error: (err) => console.error('Failed to load types', err),
    });
    this.classroomService.getGradeLevels().subscribe({
      next: (data) => this.gradeLevels.set(data),
      error: (err) => console.error('Failed to load grades', err),
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

    this.classroomService
      .createSubject(subjectName)
      .pipe(finalize(() => this.isCreatingSubjectLoading.set(false)))
      .subscribe({
        next: (newSubject) => {
          this.subjects.update((subs) => [...subs, newSubject]);
          this.form.patchValue({ subjectId: newSubject.id });
          this.isCreatingSubject.set(false);
          this.toastService.success('نجاح', 'تمت إضافة المادة الجديدة بنجاح');
        },
        error: (err) => {
          console.error('Failed to create subject', err);
          this.toastService.error('خطأ', 'فشل في إضافة المادة، يرجى المحاولة مرة أخرى');
        },
      });
  }

  
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedImage.set(file);
      
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.warning('تنبيه', 'يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح.');
      return;
    }

    this.isSubmitting.set(true);
    this.quotaError.set(null);

    const formValue = this.form.value;

    const payload: CreateClassroomRequest = {
      subjectId: formValue.subjectId,
      name: formValue.name,
      classroomTypeId: formValue.classroomTypeId,
      gradeLevelId: formValue.gradeLevelId,
      startDate: new Date(formValue.startDate).toISOString(),
      endDate: new Date(formValue.endDate).toISOString(),
      price: Number(formValue.price),
    };

    this.classroomService.createClassroom(payload).subscribe({
      next: (res) => {
        const file = this.selectedImage();
        if (file) {
          this.classroomService.uploadClassroomImage(res.classroomId, file).pipe(
            finalize(() => {
              this.isSubmitting.set(false);
              this.toastService.success('نجاح', 'تم إنشاء المرحلة الدراسية وصورة الغلاف بنجاح!');
              this.created.emit();
              this.close();
            })
          ).subscribe({
            error: () => {
              this.toastService.warning('تحذير', 'تم إنشاء المرحلة الدراسية ولكن فشل رفع الصورة.');
            }
          });
        } else {
          this.isSubmitting.set(false);
          this.toastService.success('نجاح', 'تم إنشاء المرحلة الدراسية بنجاح!');
          this.created.emit();
          this.close();
        }
      },
      error: (errorRes) => {
        this.isSubmitting.set(false);
        const responseBody = errorRes.error;
        const apiError = responseBody?.error;

        if (errorRes.status === 422 && apiError?.code === 'QUOTA_EXCEEDED') {
          this.quotaError.set('لقد تجاوزت الحد الأقصى للمراحل الدراسية في هذه الباقة.');
          return;
        }

        const msg = apiError?.message || 'حدث خطأ أثناء إنشاء المرحلة. يرجى المحاولة مرة أخرى.';
        this.toastService.error('خطأ', msg);
      },
    });
  }

  close(): void {
    this.quotaError.set(null);
    this.form.reset({ price: 0 });
    this.isCreatingSubject.set(false);
    this.modalClosed.emit();
  }
}
