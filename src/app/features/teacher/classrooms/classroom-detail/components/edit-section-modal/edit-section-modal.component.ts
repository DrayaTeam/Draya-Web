import { Component, ChangeDetectionStrategy, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { SectionService } from '../../../../services/section.service';
import { ClassroomSectionDto, UpdateSectionRequest } from '../../../../../../core/models/section.model';
import { ModalComponent } from '../../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'draya-edit-section-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, TranslatePipe],
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
  private readonly messageService = inject(MessageService, { optional: true });

  readonly isSubmitting = signal<boolean>(false);

  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
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
          this.messageService?.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم تحديث القسم بنجاح',
          });
          this.sectionUpdated.emit();
        },
        error: (err: unknown) => {
          console.error('Failed to update section', err);
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء تحديث القسم',
          });
        },
      });
  }
}
