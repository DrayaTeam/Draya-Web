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
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ClassroomService } from '../../../services/classroom.service';
import {
  ClassroomTypeDto,
  GradeLevelDto,
  SubjectDto,
  UpdateClassroomRequest,
  ClassroomDto,
} from '../../../../../core/models/classroom.model';
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
  selector: 'draya-edit-classroom-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TeacherModalComponent, SharedModule],
  templateUrl: './edit-classroom-modal.component.html',
  styleUrl: './edit-classroom-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditClassroomModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly classroomService = inject(ClassroomService);
  private readonly toastService = inject(ToastService);

  readonly isOpen = input<boolean>(false);
  readonly classroom = input<ClassroomDto | null>(null);
  readonly modalClosed = output<void>();
  readonly updated = output<void>();

  form!: FormGroup;

  // Lookup Data Signals
  readonly subjects = signal<SubjectDto[]>([]);
  readonly classroomTypes = signal<ClassroomTypeDto[]>([]);
  readonly gradeLevels = signal<GradeLevelDto[]>([]);

  // State Signals
  readonly isSubmitting = signal<boolean>(false);

  constructor() {
    effect(() => {
      const cls = this.classroom();
      if (this.isOpen() && cls && this.form) {
        // Just trigger a patch if needed, or rely on loadLookupData
        this.patchFormValues();
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
        classroomTypeId: ['', Validators.required],
        gradeLevelId: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        price: [0, [Validators.required, Validators.min(0)]],
        isActive: [true],
      },
      { validators: dateRangeValidator },
    );
  }

  private loadLookupData(): void {
    this.classroomService.getSubjects().subscribe({
      next: (data) => {
        this.subjects.set(data);
        this.patchFormValues();
      },
    });
    this.classroomService.getClassroomTypes().subscribe({
      next: (data) => {
        this.classroomTypes.set(data);
        this.patchFormValues();
      },
    });
    this.classroomService.getGradeLevels().subscribe({
      next: (data) => {
        this.gradeLevels.set(data);
        this.patchFormValues();
      },
    });
  }

  private patchFormValues(): void {
    const cls = this.classroom();
    if (!cls || !this.isOpen()) return;

    // We must map Names to IDs since ClassroomDto only has names
    const subject = this.subjects().find((s) => s.name === cls.subjectName);
    const type = this.classroomTypes().find((t) => t.name === cls.classroomTypeName);
    const grade = this.gradeLevels().find((g) => g.name === cls.gradeLevelName);

    const startStr = cls.startDate ? new Date(cls.startDate).toISOString().slice(0, 16) : '';
    const endStr = cls.endDate ? new Date(cls.endDate).toISOString().slice(0, 16) : '';

    this.form.patchValue({
      name: cls.name,
      subjectId: subject?.id || '',
      classroomTypeId: type?.id || '',
      gradeLevelId: grade?.id || '',
      startDate: startStr,
      endDate: endStr,
      price: cls.price,
      isActive: cls.isActive,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.warning('تنبيه', 'يرجى التأكد من إكمال جميع الحقول المطلوبة بشكل صحيح');
      return;
    }

    const cls = this.classroom();
    if (!cls) return;

    this.isSubmitting.set(true);

    const formValue = this.form.value;

    const payload: UpdateClassroomRequest = {
      subjectId: formValue.subjectId,
      name: formValue.name,
      classroomTypeId: formValue.classroomTypeId,
      gradeLevelId: formValue.gradeLevelId,
      startDate: new Date(formValue.startDate).toISOString(),
      endDate: new Date(formValue.endDate).toISOString(),
      price: Number(formValue.price),
      isActive: formValue.isActive,
    };

    this.classroomService
      .updateClassroom(cls.classroomId, payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.toastService.success('نجاح', 'تم تعديل بيانات الفصل بنجاح!');
          this.updated.emit();
          this.close();
        },
        error: (errorRes: HttpErrorResponse) => {
          const responseBody = errorRes.error as { error: ApiError };
          const apiError = responseBody?.error;
          const msg = apiError?.message || 'حدث خطأ أثناء تعديل الفصل. يرجى المحاولة مرة أخرى.';
          this.toastService.error('خطأ', msg);
        },
      });
  }

  close(): void {
    this.modalClosed.emit();
  }
}
