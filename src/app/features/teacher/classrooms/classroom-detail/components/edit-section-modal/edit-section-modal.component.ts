import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { SectionService } from '../../../../services/section.service';
import {
  ClassroomSectionDto,
  UpdateSectionRequest,
} from '../../../../../../core/models/section.model';
import { TeacherModalComponent } from '../../../../components/teacher-modal/teacher-modal.component';
import { ToastService } from '../../../../../../core/services/toast.service';

@Component({
  selector: 'draya-edit-section-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TeacherModalComponent, TranslatePipe],
  templateUrl: './edit-section-modal.component.html',
  styleUrl: './edit-section-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSectionModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly section = input<ClassroomSectionDto | null>(null);
  readonly sectionUpdated = output<void>();
  readonly modalClosed = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly sectionService = inject(SectionService);
  private readonly toastService = inject(ToastService);

  readonly isSubmitting = signal<boolean>(false);

  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    order: [0],
  });

  constructor() {
    effect(() => {
      const s = this.section();
      if (s && this.isOpen()) {
        this.form.patchValue({
          title: s.title,
          description: s.description || '',
          order: s.order,
        });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const currentSection = this.section();
    if (!currentSection) return;

    this.isSubmitting.set(true);

    const body: UpdateSectionRequest = {
      title: this.form.get('title')?.value,
      description: this.form.get('description')?.value || undefined,
      order: this.form.get('order')?.value || 0,
    };

    this.sectionService
      .updateSection(currentSection.id, body)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.toastService.success('تم تحديث القسم بنجاح');
          this.sectionUpdated.emit();
        },
        error: (err: unknown) => {
          console.error('Failed to update section', err);
          this.toastService.error('حدث خطأ أثناء تحديث القسم');
        },
      });
  }
}
