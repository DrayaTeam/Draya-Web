import { Component, ChangeDetectionStrategy, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { SectionService } from '../../../../services/section.service';
import {
  ClassroomSectionDto,
  CreateSectionRequest,
} from '../../../../../../core/models/section.model';
import { TeacherModalComponent } from '../../../../components/teacher-modal/teacher-modal.component';

@Component({
  selector: 'draya-create-section-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TeacherModalComponent, TranslatePipe],
  templateUrl: './create-section-modal.component.html',
  styleUrl: './create-section-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSectionModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly classroomId = input.required<string>();
  readonly sectionCreated = output<ClassroomSectionDto>();
  readonly modalClosed = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly sectionService = inject(SectionService);
  private readonly messageService = inject(MessageService, { optional: true });

  readonly isSubmitting = signal<boolean>(false);

  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    order: [null],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const body: CreateSectionRequest = {
      title: this.form.get('title')?.value,
      description: this.form.get('description')?.value || undefined,
      order: this.form.get('order')?.value || 0,
    };

    this.sectionService
      .createSection(this.classroomId(), body)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (dto: ClassroomSectionDto) => {
          this.messageService?.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم إنشاء القسم بنجاح',
          });
          this.form.reset();
          this.sectionCreated.emit(dto);
        },
        error: (err: unknown) => {
          console.error('Failed to create section', err);
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء إنشاء القسم',
          });
        },
      });
  }
}
