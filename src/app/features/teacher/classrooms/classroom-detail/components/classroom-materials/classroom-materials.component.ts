import { Component, ChangeDetectionStrategy, input, inject, signal, effect, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';

import { MaterialService } from '../../../../services/material.service';
import { SectionService } from '../../../../services/section.service';
import {
  ClassroomMaterialDto,
  MaterialVersionDto,
} from '../../../../../../core/models/material.model';
import { ClassroomSectionDto, SectionMaterialDto } from '../../../../../../core/models/section.model';

import { UploadMaterialModalComponent } from '../upload-material-modal/upload-material-modal.component';
import { UploadVersionModalComponent } from '../upload-version-modal/upload-version-modal.component';
import { MaterialVersionsModalComponent } from '../material-versions-modal/material-versions-modal.component';
import { CreateSectionModalComponent } from '../create-section-modal/create-section-modal.component';
import { EditSectionModalComponent } from '../edit-section-modal/edit-section-modal.component';

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
    TranslatePipe,
    UploadMaterialModalComponent,
    UploadVersionModalComponent,
    MaterialVersionsModalComponent,
    CreateSectionModalComponent,
    EditSectionModalComponent,
  ],
  templateUrl: './classroom-materials.component.html',
  styleUrl: './classroom-materials.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassroomMaterialsComponent {
  readonly classroomId = input.required<string>();

  private readonly sectionService = inject(SectionService);
  private readonly materialService = inject(MaterialService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService, { optional: true });

  readonly sectionsResult = signal<ClassroomSectionDto[] | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly expandedSections = signal<Record<string, boolean>>({});

  // Section Modals
  readonly isCreateSectionModalVisible = signal<boolean>(false);
  readonly isEditSectionModalVisible = signal<boolean>(false);
  readonly selectedSection = signal<ClassroomSectionDto | null>(null);

  // Material Modals
  readonly isUploadModalVisible = signal<boolean>(false);
  readonly targetSectionIdForUpload = signal<string | null>(null);
  
  readonly isUploadVersionModalVisible = signal<boolean>(false);
  readonly isVersionsModalVisible = signal<boolean>(false);
  readonly selectedMaterial = signal<ClassroomMaterialDto | null>(null);

  readonly openMenuId = signal<string | null>(null);

  @HostListener('document:click')
  onClickOutside(): void {
    this.openMenuId.set(null);
  }

  constructor() {
    effect(() => {
      const id = this.classroomId();
      if (id) {
        this.loadSections();
      }
    });
  }

  loadSections(): void {
    const id = this.classroomId();
    if (!id) return;

    this.isLoading.set(true);
    this.sectionService
      .getSections(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (sections) => {
          this.sectionsResult.set(sections || []);
          // Ensure all sections are expanded by default or keep previous state
          const newExpanded = { ...this.expandedSections() };
          sections?.forEach(s => {
            if (newExpanded[s.id] === undefined) {
              newExpanded[s.id] = true;
            }
          });
          this.expandedSections.set(newExpanded);
        },
        error: (err) => {
          console.error('Failed to load sections', err);
          this.sectionsResult.set(null);
        },
      });
  }

  toggleSection(sectionId: string): void {
    this.expandedSections.update(current => ({
      ...current,
      [sectionId]: !current[sectionId]
    }));
  }

  openCreateSectionModal(): void {
    this.isCreateSectionModalVisible.set(true);
  }

  onSectionCreated(): void {
    this.isCreateSectionModalVisible.set(false);
    this.loadSections();
  }

  openEditSectionModal(section: ClassroomSectionDto, event: Event): void {
    event.stopPropagation();
    this.selectedSection.set(section);
    this.isEditSectionModalVisible.set(true);
  }

  onSectionUpdated(): void {
    this.isEditSectionModalVisible.set(false);
    this.selectedSection.set(null);
    this.loadSections();
  }

  confirmDeleteSection(section: ClassroomSectionDto, event: Event): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا القسم؟ سيتم حذف جميع مواده.',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deleteSection(section.id);
      },
    });
  }

  private deleteSection(sectionId: string): void {
    this.sectionService.deleteSection(sectionId).subscribe({
      next: () => {
        this.messageService?.add({
          severity: 'success',
          summary: 'تم الحذف',
          detail: 'تم حذف القسم بنجاح.',
        });
        this.loadSections();
      },
      error: (err) => {
        console.error('Failed to delete section', err);
        this.messageService?.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'حدث خطأ أثناء حذف القسم.',
        });
      }
    });
  }

  openUploadModal(sectionId: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.targetSectionIdForUpload.set(sectionId);
    this.isUploadModalVisible.set(true);
  }

  onUploadSuccess(): void {
    this.isUploadModalVisible.set(false);
    this.targetSectionIdForUpload.set(null);
    this.loadSections();
  }

  toggleMenu(materialId: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId.update(current => current === materialId ? null : materialId);
  }

  openStream(material: SectionMaterialDto): void {
    this.messageService?.add({
      severity: 'info',
      summary: 'جاري التحميل',
      detail: 'جاري جلب الرابط، يرجى الانتظار...',
    });
    this.materialService.getMaterialStream(material.id).subscribe({
      next: (res) => {
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

  private mapToClassroomMaterial(material: SectionMaterialDto): ClassroomMaterialDto {
    return {
      materialId: material.id,
      title: material.title,
      materialType: material.materialType as any,
      createdAt: material.createdAt,
      currentVersion: {
        versionId: '',
        versionNumber: 1,
        fileUrl: '',
        parseStatus: 'Parsed',
        uploadedAt: material.createdAt,
        errorMessage: null
      }
    };
  }

  openUploadVersionModal(material: SectionMaterialDto): void {
    this.selectedMaterial.set(this.mapToClassroomMaterial(material));
    this.isUploadVersionModalVisible.set(true);
  }

  openVersionHistoryModal(material: SectionMaterialDto): void {
    this.selectedMaterial.set(this.mapToClassroomMaterial(material));
    this.isVersionsModalVisible.set(true);
  }

  onUploadVersionSuccess(): void {
    this.isUploadVersionModalVisible.set(false);
    this.loadSections();
  }

  confirmDeleteMaterial(material: SectionMaterialDto): void {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف المادة التعليمية "${material.title}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deleteMaterial(material.id);
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
        this.loadSections();
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
