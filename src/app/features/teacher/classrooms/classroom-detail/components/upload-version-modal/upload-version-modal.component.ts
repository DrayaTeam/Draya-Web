import { Component, ChangeDetectionStrategy, input, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { MaterialService } from '../../../../services/material.service';
import {
  MaterialVersionDto,
  ClassroomMaterialDto,
} from '../../../../../../core/models/material.model';

@Component({
  selector: 'draya-upload-version-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule],
  templateUrl: './upload-version-modal.component.html',
  styleUrl: './upload-version-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadVersionModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly material = input<ClassroomMaterialDto | null>(null);
  readonly uploadSuccess = output<MaterialVersionDto>();
  readonly cancelUpload = output<void>();

  private readonly materialService = inject(MaterialService);
  private readonly messageService = inject(MessageService, { optional: true });

  readonly isSubmitting = signal<boolean>(false);
  readonly selectedFile = signal<File | null>(null);
  readonly linkUrl = signal<string>('');
  readonly fileError = signal<string | null>(null);

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

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
    const mat = this.material();
    if (!mat) return;

    this.fileError.set(null);

    const formData = new FormData();

    if (mat.materialType === 'PDF' || mat.materialType === 'Video') {
      const file = this.selectedFile();
      if (!file) {
        this.fileError.set('يرجى اختيار ملف للرفع.');
        return;
      }
      formData.append('file', file);
    } else if (mat.materialType === 'Link') {
      const url = this.linkUrl();
      if (!url) {
        this.fileError.set('يرجى إدخال الرابط.');
        return;
      }
      formData.append('url', url);
      // Backend incorrectly requires 'file' field for all types. Send an empty file to bypass.
      formData.append('file', new File([''], 'empty.txt', { type: 'text/plain' }));
    }

    this.isSubmitting.set(true);

    this.materialService
      .uploadMaterialVersion(mat.materialId, formData)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (dto) => {
          this.messageService?.add({
            severity: 'success',
            summary: 'تم بنجاح',
            detail: 'تم رفع الإصدار الجديد بنجاح.',
          });
          this.resetState();
          this.uploadSuccess.emit(dto);
        },
        error: (err) => {
          console.error('Upload failed', err);
          this.messageService?.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'حدث خطأ أثناء رفع الإصدار.',
          });
        },
      });
  }

  onCancel(): void {
    this.resetState();
    this.cancelUpload.emit();
  }

  private resetState(): void {
    this.selectedFile.set(null);
    this.linkUrl.set('');
    this.fileError.set(null);
  }
}
