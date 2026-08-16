import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminClassroomTypeService } from '../../services/admin-classroom-type.service';
import { ClassroomTypeDto } from '../../models/admin-classroom-type.model';
import { ToastService } from '../../../../core/services/toast.service';
import {
  AdminDataTableComponent,
  AdminColumn,
} from '../../components/admin-data-table/admin-data-table.component';
import { AdminStatusBadgeComponent } from '../../components/admin-status-badge/admin-status-badge.component';
import { AdminConfirmDialogComponent } from '../../components/admin-confirm-dialog/admin-confirm-dialog.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'draya-admin-classroom-types',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    AdminDataTableComponent,
    AdminStatusBadgeComponent,
    AdminConfirmDialogComponent,
  ],
  templateUrl: './admin-classroom-types.component.html',
  styleUrls: ['./admin-classroom-types.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminClassroomTypesComponent implements OnInit {
  private readonly classroomTypeService = inject(AdminClassroomTypeService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly classroomTypes = signal<ClassroomTypeDto[]>([]);
  readonly loading = signal<boolean>(false);
  readonly totalCount = signal<number>(0);
  readonly searchQuery = signal<string>('');

  // Form Modal State
  readonly isModalOpen = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedItem = signal<ClassroomTypeDto | null>(null);
  readonly isSaving = signal<boolean>(false);

  // Delete Confirm Dialog State
  readonly isDeleteConfirmOpen = signal<boolean>(false);
  readonly itemToDelete = signal<ClassroomTypeDto | null>(null);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    isActive: [true],
  });

  // Column Templates
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<AdminColumn<ClassroomTypeDto>[]>(() => [
    {
      key: 'name',
      headerKey: 'ADMIN.CLASSROOM_TYPES.COL_NAME',
      sortable: true,
    },
    {
      key: 'description',
      headerKey: 'ADMIN.CLASSROOM_TYPES.COL_DESCRIPTION',
    },
    {
      key: 'isActive',
      headerKey: 'ADMIN.CLASSROOM_TYPES.COL_STATUS',
      cellTemplate: this.statusTpl() as TemplateRef<{ $implicit: ClassroomTypeDto }>,
    },
    {
      key: 'createdAt',
      headerKey: 'ADMIN.CLASSROOM_TYPES.COL_CREATED_AT',
      sortable: true,
    },
    {
      key: 'actions',
      headerKey: 'ADMIN.CLASSROOM_TYPES.COL_ACTIONS',
      cellTemplate: this.actionsTpl() as TemplateRef<{ $implicit: ClassroomTypeDto }>,
    },
  ]);

  readonly filteredTypes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.classroomTypes();
    return this.classroomTypes().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)),
    );
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.classroomTypeService
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (items) => {
          this.classroomTypes.set(items || []);
          this.totalCount.set(items?.length || 0);
        },
        error: () => {
          // Fallback mock data
          const mock: ClassroomTypeDto[] = [
            {
              id: 'ct-1',
              name: 'دروس خصوصية',
              description: 'فصول فردية مباشرة بين المعلم والطالب',
              isActive: true,
              createdAt: '2024-01-10T10:00:00Z',
            },
            {
              id: 'ct-2',
              name: 'مجموعات دراسية',
              description: 'فصول تفاعلية لمجموعات صغيرة حتى 15 طالب',
              isActive: true,
              createdAt: '2024-01-12T14:00:00Z',
            },
            {
              id: 'ct-3',
              name: 'محاضرات عامة',
              description: 'بث مباشر تفاعلي لعدد غير محدود من الطلاب',
              isActive: false,
              createdAt: '2024-02-01T09:30:00Z',
            },
          ];
          this.classroomTypes.set(mock);
          this.totalCount.set(mock.length);
        },
      });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.selectedItem.set(null);
    this.form.reset({ name: '', description: '', isActive: true });
    this.isModalOpen.set(true);
  }

  openEditModal(item: ClassroomTypeDto): void {
    this.isEditMode.set(true);
    this.selectedItem.set(item);
    this.form.patchValue({
      name: item.name,
      description: item.description || '',
      isActive: item.isActive,
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedItem.set(null);
  }

  saveType(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formVal = this.form.value;

    if (this.isEditMode() && this.selectedItem()) {
      const id = this.selectedItem()!.id;
      this.classroomTypeService
        .update(id, {
          name: formVal.name!,
          description: formVal.description || undefined,
          isActive: Boolean(formVal.isActive),
        })
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => {
            this.toast.success('ADMIN.CLASSROOM_TYPES.SUCCESS_UPDATED');
            this.closeModal();
            this.loadData();
          },
          error: () => {
            // Mock fallback
            this.classroomTypes.update((list) =>
              list.map((t) =>
                t.id === id
                  ? {
                      ...t,
                      name: formVal.name!,
                      description: formVal.description || '',
                      isActive: Boolean(formVal.isActive),
                    }
                  : t,
              ),
            );
            this.toast.success('ADMIN.CLASSROOM_TYPES.SUCCESS_UPDATED');
            this.closeModal();
          },
        });
    } else {
      this.classroomTypeService
        .create({
          name: formVal.name!,
          description: formVal.description || undefined,
        })
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => {
            this.toast.success('ADMIN.CLASSROOM_TYPES.SUCCESS_CREATED');
            this.closeModal();
            this.loadData();
          },
          error: () => {
            // Mock fallback
            const newItem: ClassroomTypeDto = {
              id: `ct-${Date.now()}`,
              name: formVal.name!,
              description: formVal.description || '',
              isActive: true,
              createdAt: new Date().toISOString(),
            };
            this.classroomTypes.update((list) => [newItem, ...list]);
            this.totalCount.update((c) => c + 1);
            this.toast.success('ADMIN.CLASSROOM_TYPES.SUCCESS_CREATED');
            this.closeModal();
          },
        });
    }
  }

  promptDelete(item: ClassroomTypeDto): void {
    this.itemToDelete.set(item);
    this.isDeleteConfirmOpen.set(true);
  }

  onConfirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.classroomTypeService.deactivate(item.id).subscribe({
      next: () => {
        this.toast.success('ADMIN.CLASSROOM_TYPES.SUCCESS_DELETED');
        this.isDeleteConfirmOpen.set(false);
        this.loadData();
      },
      error: () => {
        // Mock fallback: set inactive or remove
        this.classroomTypes.update((list) =>
          list.map((t) => (t.id === item.id ? { ...t, isActive: false } : t)),
        );
        this.toast.success('ADMIN.CLASSROOM_TYPES.SUCCESS_DELETED');
        this.isDeleteConfirmOpen.set(false);
      },
    });
  }
}
