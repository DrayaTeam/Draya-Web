import { Component, ChangeDetectionStrategy, input, inject, signal, effect, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs/operators';

import { MaterialService } from '../../../../services/material.service';
import {
  ClassroomMaterialDto,
  MaterialVersionDto,
} from '../../../../../../core/models/material.model';
import { UploadMaterialModalComponent } from '../upload-material-modal/upload-material-modal.component';
import { UploadVersionModalComponent } from '../upload-version-modal/upload-version-modal.component';
import { MaterialVersionsModalComponent } from '../material-versions-modal/material-versions-modal.component';

@Component({
  selector: 'draya-classroom-materials',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ConfirmDialogModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    UploadMaterialModalComponent,
    UploadVersionModalComponent,
    MaterialVersionsModalComponent,
  ],
  templateUrl: './classroom-materials.component.html',
  styleUrl: './classroom-materials.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassroomMaterialsComponent {
  readonly classroomId = input.required<string>();

  private readonly materialService = inject(MaterialService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService, { optional: true });

  readonly materialsResult = signal<ClassroomMaterialDto[] | null>(null);
  readonly isLoading = signal<boolean>(false);

  // Upload modal state
  readonly isUploadModalVisible = signal<boolean>(false);
  
  // Version Modals state
  readonly isUploadVersionModalVisible = signal<boolean>(false);
  readonly isVersionsModalVisible = signal<boolean>(false);
  readonly selectedMaterial = signal<ClassroomMaterialDto | null>(null);

  pageNumber = 1;
  pageSize = 20;

  readonly openMenuId = signal<string | null>(null);

  @HostListener('document:click')
  onClickOutside(): void {
    this.openMenuId.set(null);
  }

  constructor() {
    effect(() => {
      const id = this.classroomId();
      if (id) {
        this.pageNumber = 1;
        this.loadMaterials();
      }
    });
  }

  loadMaterials(): void {
    const id = this.classroomId();
    if (!id) return;

    this.isLoading.set(true);
    this.materialService
      .getClassroomMaterials(id, this.pageNumber, this.pageSize)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => this.materialsResult.set(res.items || []),
        error: (err) => {
          console.error('Failed to load materials', err);
          this.materialsResult.set(null);
        },
      });
  }

  openUploadModal(): void {
    this.isUploadModalVisible.set(true);
  }

  onUploadSuccess(dto: ClassroomMaterialDto): void {
    this.isUploadModalVisible.set(false);
    this.materialsResult.update((current) => {
      if (!current) return [dto];
      return [dto, ...current];
    });
  }
  toggleMenu(materialId: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId.update(current => current === materialId ? null : materialId);
  }

  openStream(material: ClassroomMaterialDto): void {
    this.messageService?.add({
      severity: 'info',
      summary: 'جاري التحميل',
      detail: 'جاري جلب الرابط، يرجى الانتظار...',
    });
    this.materialService.getMaterialStream(material.materialId).subscribe({
      next: (res) => {
        // ============================================================================
        // 🚨 TEMPORARY HOTFIX 🚨
        // Reverses a backend URL-encoding bug. See docs/draya-api-full-reference.md
        // The backend incorrectly encodes Arabic characters in the streamUrl as %<hex> 
        // (e.g., %645 instead of the standard UTF-8 %D9%85).
        // 
        // REMOVE THIS once the backend team fixes their Arabic path encoding!
        // WARNING: If a material title legitimately contains the exact "%123" pattern,
        // this regex WILL break the real URL. Do not keep this code long-term.
        // ============================================================================
        const fixedUrl = res.streamUrl.replace(/%([0-9A-Fa-f]{3,4})/g, (_, hex) => 
          String.fromCharCode(parseInt(hex, 16))
        );
        
        window.open(encodeURI(fixedUrl), '_blank');
      },
      error: (err) => {
        console.error('Failed to get stream url', err);
        this.messageService?.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل فتح المادة. حاول مرة أخرى لاحقًا.',
        });
      }
    });
  }

  openUploadVersionModal(material: ClassroomMaterialDto): void {
    this.selectedMaterial.set(material);
    this.isUploadVersionModalVisible.set(true);
  }

  openVersionHistoryModal(material: ClassroomMaterialDto): void {
    this.selectedMaterial.set(material);
    this.isVersionsModalVisible.set(true);
  }

  onUploadVersionSuccess(newVersion: MaterialVersionDto): void {
    this.isUploadVersionModalVisible.set(false);
    
    // Update the specific material's currentVersion in the list without full reload
    this.materialsResult.update((current) => {
      if (!current) return current;
      return current.map(m => {
        if (m.materialId === this.selectedMaterial()?.materialId) {
          return { ...m, currentVersion: newVersion };
        }
        return m;
      });
    });
    
    // TODO: Poll status if necessary, but backend is fast and versions array shows it
  }

  confirmDeleteMaterial(material: ClassroomMaterialDto): void {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف المادة التعليمية "${material.title}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deleteMaterial(material.materialId);
      },
    });
  }

  private deleteMaterial(materialId: string): void {
    this.materialService.removeMaterial(materialId).subscribe({
      next: () => {
        this.messageService?.add({
          severity: 'success',
          summary: 'تم الحذف',
          detail: 'تم حذف المادة التعليمية بنجاح.',
        });
        this.loadMaterials();
      },
      error: (err) => {
        console.error('Failed to delete material', err);
        this.messageService?.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء حذف المادة التعليمية.',
        });
      },
    });
  }
}
