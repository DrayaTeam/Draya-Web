import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
  signal,
  effect,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, takeUntil, switchMap } from 'rxjs/operators';
import { Subject, timer } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { MaterialService } from '../../../../services/material.service';
import { SectionService } from '../../../../services/section.service';
import { ClassroomMaterialDto } from '../../../../../../core/models/material.model';
import { ClassroomSectionDto, SectionMaterialDto } from '../../../../../../core/models/section.model';
import { resolveMaterialUrl } from '../../../../../../core/services/student-library.service';

import { UploadMaterialModalComponent } from '../upload-material-modal/upload-material-modal.component';
import { UploadVersionModalComponent } from '../upload-version-modal/upload-version-modal.component';
import { MaterialVersionsModalComponent } from '../material-versions-modal/material-versions-modal.component';
import { TeacherModalComponent } from '../../../../components/teacher-modal/teacher-modal.component'; 
import { SharedModule } from 'primeng/api';
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
    TeacherModalComponent,
    SharedModule,
  ],
  templateUrl: './classroom-materials.component.html',
  styleUrl: './classroom-materials.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassroomMaterialsComponent implements OnInit, OnDestroy {
  readonly classroomId = input.required<string>();

  private readonly sectionService = inject(SectionService);
  private readonly materialService = inject(MaterialService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService, { optional: true });
  private readonly sanitizer = inject(DomSanitizer);

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

  // Version Modals state
  readonly isDeleteSectionModalOpen = signal<boolean>(false);
  readonly sectionToDelete = signal<string | null>(null);
  readonly isDeleteMaterialModalOpen = signal<boolean>(false);
  readonly materialToDelete = signal<string | null>(null);
  readonly isUploadVersionModalVisible = signal<boolean>(false);
  readonly isVersionsModalVisible = signal(false);
  readonly selectedMaterial = signal<ClassroomMaterialDto | null>(null);

  // Category Tabs State
  readonly activeTabBySection = signal<Record<string, string>>({});

  setSectionTab(sectionId: string, tab: string): void {
    this.activeTabBySection.update(current => ({
      ...current,
      [sectionId]: tab
    }));
  }

  getSectionTab(section: ClassroomSectionDto): string {
    const active = this.activeTabBySection()[section.id];
    if (active) return active;
    
    // Default to the first available category
    if (section.videos?.length) return 'videos';
    if (section.documents?.length) return 'documents';
    if (section.exams?.length) return 'exams';
    return 'all'; // fallback
  }

  // Inline Preview Modal state
  readonly activePreviewMaterial = signal<ClassroomMaterialDto | null>(null);
  readonly activePreviewUrl = signal<string | null>(null);
  readonly isPreviewLoading = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);
  readonly previewError = signal<string | null>(null);
  private cancelPolling$ = new Subject<void>();

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

  ngOnInit(): void {
    if (this.classroomId()) {
      this.loadSections();
    }
  }

  ngOnDestroy(): void {
    this.cancelPolling$.next();
    this.cancelPolling$.complete();
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
          const mappedSections = (sections || []).map(s => ({
            ...s,
            materials: [...(s.documents || []), ...(s.videos || [])]
          }));
          this.sectionsResult.set(mappedSections);
          // Ensure all sections are expanded by default or keep previous state
          const newExpanded = { ...this.expandedSections() };
          mappedSections.forEach(s => {
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
    this.sectionToDelete.set(section.id);
    this.isDeleteSectionModalOpen.set(true);
  }
  
  executeDeleteSection(): void {
    const id = this.sectionToDelete();
    if (!id) return;
    this.isDeleteSectionModalOpen.set(false);
    this.deleteSection(id);
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
    this.openMenuId.update((current) => (current === materialId ? null : materialId));
  }

  openStream(material: SectionMaterialDto): void {
    const fullMaterial = this.mapToClassroomMaterial(material);
    if (fullMaterial.materialType === 'Link') {
      if (fullMaterial.currentVersion?.fileUrl) {
        window.open(fullMaterial.currentVersion.fileUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    this.activePreviewMaterial.set(fullMaterial);
    this.isPreviewLoading.set(true);
    this.isProcessing.set(false);
    this.previewError.set(null);
    this.activePreviewUrl.set(null);

    // Cancel any existing polling
    this.cancelPolling$.next();

    // 1. If it's a Video, we must use getMaterialStream API
    if (fullMaterial.materialType === 'Video') {
      this.materialService.getMaterialStream(fullMaterial.materialId).subscribe({
        next: (res) => {
          let fixedUrl = res.streamUrl || fullMaterial.currentVersion?.fileUrl || '';
          if (fixedUrl) {
            fixedUrl = fixedUrl.replace(/%([0-9A-Fa-f]{3,4})/g, (_, hex) =>
              String.fromCharCode(parseInt(hex, 16)),
            );
            this.activePreviewUrl.set(resolveMaterialUrl(fixedUrl));
            this.isPreviewLoading.set(false);
          } else {
            // Video has no URL yet -> poll versions
            this.pollForReadyMaterial(fullMaterial.materialId);
          }
        },
        error: (err) => {
          console.error('Failed to get stream:', err);
          let fallbackUrl = fullMaterial.currentVersion?.fileUrl || '';
          if (fallbackUrl) {
            fallbackUrl = fallbackUrl.replace(/%([0-9A-Fa-f]{3,4})/g, (_, hex) =>
              String.fromCharCode(parseInt(hex, 16)),
            );
            this.activePreviewUrl.set(resolveMaterialUrl(fallbackUrl));
            this.isPreviewLoading.set(false);
          } else {
            this.pollForReadyMaterial(fullMaterial.materialId);
          }
        },
      });
      return;
    }

    // 2. If it's a PDF/Document, bypass stream API
    let fixedUrl = fullMaterial.currentVersion?.fileUrl || '';
    if (fixedUrl) {
      fixedUrl = fixedUrl.replace(/%([0-9A-Fa-f]{3,4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16)),
      );
      this.activePreviewUrl.set(resolveMaterialUrl(fixedUrl));
      this.isPreviewLoading.set(false);
    } else {
      // PDF has no URL yet -> poll versions
      this.pollForReadyMaterial(fullMaterial.materialId);
    }
  }

  private pollForReadyMaterial(materialId: string): void {
    this.isPreviewLoading.set(false);
    this.isProcessing.set(true);
    
    // Poll every 3 seconds
    timer(0, 3000).pipe(
      takeUntil(this.cancelPolling$),
      switchMap(() => this.materialService.getMaterialVersions(materialId))
    ).subscribe({
      next: (versions) => {
        const latest = versions && versions.length > 0 ? versions[versions.length - 1] : null;
        if (latest && latest.fileUrl) {
          // Yay! The cloud has finished processing and we have a URL!
          this.isProcessing.set(false);
          const fetchedUrl = latest.fileUrl.replace(/%([0-9A-Fa-f]{3,4})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16)),
          );
          this.activePreviewUrl.set(resolveMaterialUrl(fetchedUrl));
          // Stop polling since we found it
          this.cancelPolling$.next();
        }
        // If not found yet, it will just poll again in 3 seconds.
      },
      error: (err) => {
        console.error('Polling failed', err);
        // If there's an actual network failure, stop polling and show error
        this.isProcessing.set(false);
        this.previewError.set('فشل في تحميل العرض. الرجاء المحاولة مرة أخرى.');
        this.cancelPolling$.next();
      }
    });
  }

  closePreview(): void {
    this.cancelPolling$.next();
    this.activePreviewMaterial.set(null);
    this.activePreviewUrl.set(null);
    this.previewError.set(null);
    this.isPreviewLoading.set(false);
    this.isProcessing.set(false);
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

  private mapToClassroomMaterial(material: SectionMaterialDto): ClassroomMaterialDto {
    const actualUrl = material.fileUrl || material.videoUrl || '';
    return {
      materialId: material.id,
      title: material.title,
      materialType: material.materialType as ClassroomMaterialDto['materialType'],
      createdAt: material.createdAt,
      currentVersion: {
        versionId: '',
        versionNumber: 1,
        fileUrl: actualUrl,
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
    this.materialToDelete.set(material.id);
    this.isDeleteMaterialModalOpen.set(true);
  }
  
  executeDeleteMaterial(): void {
    const id = this.materialToDelete();
    if (!id) return;
    this.isDeleteMaterialModalOpen.set(false);
    this.deleteMaterial(id);
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
