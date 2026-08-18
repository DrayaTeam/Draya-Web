// src/app/features/teacher/classrooms/classroom-detail/components/upload-material-modal/upload-material-modal.component.ts
import { Component, ChangeDetectionStrategy, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';

import { MaterialService } from '../../../../services/material.service';
import { MaterialType, ClassroomMaterialDto } from '../../../../../../core/models/material.model';
import { ModalComponent } from '../../../../../../shared/components/modal/modal.component';

@Component({
  selector: 'draya-upload-material-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
  ],
  templateUrl: './upload-material-modal.component.html',
  styleUrl: './upload-material-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadMaterialModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly sectionId = input.required<string>();
  readonly uploadSuccess = output<ClassroomMaterialDto>();
  readonly cancelUpload = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly materialService = inject(MaterialService);
  private readonly messageService = inject(MessageService, { optional: true });

  readonly isSubmitting = signal<boolean>(false);
  readonly selectedFile = signal<File | null>(null);
  readonly fileError = signal<string | null>(null);

  readonly typeOptions = [
    { label: 'ملف (PDF، مستند، أو صورة)', value: 'PDF' },
    { label: 'فيديو', value: 'Video' },
  ];

  readonly form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(1000)]],
    type: ['PDF', Validators.required],
  });

  get currentType(): MaterialType {
    return this.form.get('type')?.value;
  }

  onTypeChange(): void {
    // URL logic removed. All types require a file now.
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Size limit validation (200MB for all file types)
      const MAX_SIZE = 200 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        this.fileError.set(`حجم الملف يتجاوز الحد الأقصى (200 ميجابايت).`);
        this.selectedFile.set(null);
        input.value = '';
        return;
      }

      this.fileError.set(null);
      this.selectedFile.set(file);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const type = this.currentType;
    if ((type === 'PDF' || type === 'Video') && !this.selectedFile()) {
      this.fileError.set('يرجى اختيار ملف للرفع.');
      return;
    }

    this.isSubmitting.set(true);

    const formData = new FormData();
    formData.append('title', this.form.get('title')?.value);

    const desc = this.form.get('description')?.value;
    if (desc) {
      formData.append('description', desc);
    }

    formData.append('materialType', type);

    if (type === 'PDF' || type === 'Video') {
      const file = this.selectedFile();
      if (file) {
        formData.append('file', file);
      }
    }

    this.materialService
      .addMaterialToSection(this.sectionId(), formData)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (dto: ClassroomMaterialDto) => {
          this.messageService?.add({
            severity: 'success',
            summary: 'تم بنجاح',
            detail: 'تم رفع المادة التعليمية بنجاح.',
          });
          this.uploadSuccess.emit(dto);
        },
        error: (err) => {
          console.error('Upload failed', err);
          
          // Try to extract specific API error messages
          let errorDetail = 'حدث خطأ أثناء رفع المادة التعليمية. يرجى المحاولة مرة أخرى.';
          if (err.error?.error?.details?.length) {
            errorDetail = err.error.error.details.map((d: { field: string; issue: string }) => `${d.field}: ${d.issue}`).join('\n');
          } else if (err.error?.error?.message) {
            errorDetail = err.error.error.message;
          }

          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: errorDetail,
          });
        },
      });
  }
}
