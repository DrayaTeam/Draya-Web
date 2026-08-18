import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
  signal,
  effect,
  HostListener,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
import { resolveMaterialUrl } from '../../../../../../core/services/student-library.service';
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
  private readonly sanitizer = inject(DomSanitizer);

  readonly materialsResult = signal<ClassroomMaterialDto[] | null>(null);
  readonly isLoading = signal<boolean>(false);

  // Upload modal state
  readonly isUploadModalVisible = signal<boolean>(false);

  // Version Modals state
  readonly isUploadVersionModalVisible = signal<boolean>(false);
  readonly isVersionsModalVisible = signal<boolean>(false);
  readonly selectedMaterial = signal<ClassroomMaterialDto | null>(null);

  // Inline Preview Modal state
  readonly activePreviewMaterial = signal<ClassroomMaterialDto | null>(null);
  readonly activePreviewUrl = signal<string | null>(null);
  readonly isPreviewLoading = signal<boolean>(false);
  readonly previewError = signal<string | null>(null);

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
    this.openMenuId.update((current) => (current === materialId ? null : materialId));
  }

  openStream(material: ClassroomMaterialDto): void {
    if (material.materialType === 'Link') {
      if (material.currentVersion?.fileUrl) {
        window.open(material.currentVersion.fileUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    this.activePreviewMaterial.set(material);
    this.isPreviewLoading.set(true);
    this.previewError.set(null);
    this.activePreviewUrl.set(null);

    this.materialService.getMaterialStream(material.materialId).subscribe({
      next: (res) => {
        let fixedUrl = res.streamUrl || material.currentVersion?.fileUrl || '';
        if (fixedUrl) {
          fixedUrl = fixedUrl.replace(/%([0-9A-Fa-f]{3,4})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16)),
          );
          this.activePreviewUrl.set(resolveMaterialUrl(fixedUrl));
        } else {
          this.previewError.set('لم يتم العثور على رابط مباشر لهذه المادة التعليمية.');
        }
        this.isPreviewLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to get stream url', err);
        const fallbackUrl = material.currentVersion?.fileUrl;
        if (fallbackUrl) {
          this.activePreviewUrl.set(resolveMaterialUrl(fallbackUrl));
        } else {
          this.previewError.set('فشل جلب رابط المادة التعليمية من الخادم.');
        }
        this.isPreviewLoading.set(false);
      },
    });
  }

  closePreview(): void {
    this.activePreviewMaterial.set(null);
    this.activePreviewUrl.set(null);
    this.previewError.set(null);
    this.isPreviewLoading.set(false);
  }

  getSafePdfUrl(): SafeResourceUrl {
    const rawUrl = this.activePreviewUrl() || '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  }

  onVideoError(): void {
    this.previewError.set(
      'تعذر تشغيل الفيديو داخل المشغل المدمج (قد يكون الرابط منتهي الصلاحية أو الصيغة تتطلب مشغل خارجي).',
    );
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
      return current.map((m) => {
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
