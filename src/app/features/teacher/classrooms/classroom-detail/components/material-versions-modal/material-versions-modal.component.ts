import { Component, ChangeDetectionStrategy, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ModalComponent } from '../../../../../../shared/components/modal/modal.component';
import { finalize } from 'rxjs/operators';
import { MaterialService } from '../../../../services/material.service';
import { MaterialVersionDto, ClassroomMaterialDto } from '../../../../../../core/models/material.model';

@Component({
  selector: 'draya-material-versions-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, ModalComponent],
  templateUrl: './material-versions-modal.component.html',
  styleUrl: './material-versions-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialVersionsModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly material = input<ClassroomMaterialDto | null>(null);
  readonly closeModal = output<void>();

  private readonly materialService = inject(MaterialService);

  readonly isLoading = signal<boolean>(false);
  readonly versions = signal<MaterialVersionDto[]>([]);
  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const mat = this.material();
      if (open && mat) {
        this.loadVersions(mat.materialId);
      } else {
        this.versions.set([]);
        this.error.set(null);
      }
    });
  }

  private loadVersions(materialId: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.materialService.getMaterialVersions(materialId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          // Sort by version number descending
          this.versions.set(data.sort((a, b) => b.versionNumber - a.versionNumber));
        },
        error: (err) => {
          console.error('Failed to load versions', err);
          this.error.set('حدث خطأ أثناء تحميل سجل الإصدارات.');
        }
      });
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
