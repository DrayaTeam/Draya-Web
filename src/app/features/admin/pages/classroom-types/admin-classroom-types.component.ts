import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
  viewChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminClassroomTypeService } from '../../services/admin-classroom-type.service';
import { ClassroomTypeDto } from '../../models/admin-classroom-type.model';
import {
  AdminDataTableComponent,
  AdminColumn,
} from '../../components/admin-data-table/admin-data-table.component';
import { AdminStatusBadgeComponent } from '../../components/admin-status-badge/admin-status-badge.component';
import { AdminConfirmDialogComponent } from '../../components/admin-confirm-dialog/admin-confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';
import { finalize } from 'rxjs/operators';

const DEFAULT_CLASSROOM_TYPES: ClassroomTypeDto[] = [
  {
    id: '1',
    name: 'مجموعة سنتر (حضوري)',
    description: 'فصل دراسي داخل مقر ومجموعات حضورية',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'أونلاين تفاعلي مباشر',
    description: 'حصص ومحاضرات تفاعلية عبر البث المباشر',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'دروس مسجلة (Self-paced)',
    description: 'محاضرات ومواد مسجلة متاحة طوال الفصل الدراسي',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'متابعة فردية خاصة (Private)',
    description: 'متابعة خاصة 1-on-1 واختبارات دورية',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

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

  // Preset suggestions
  readonly presetSuggestions = [
    'مجموعة سنتر (حضوري)',
    'أونلاين تفاعلي مباشر',
    'دروس مسجلة (Self-paced)',
    'متابعة فردية خاصة (Private)',
    'مراجعة نهائية مكثفة',
  ];

  selectPreset(name: string): void {
    this.form.patchValue({ name });
  }

  // Modal State
  readonly isModalOpen = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly selectedItem = signal<ClassroomTypeDto | null>(null);

  // Delete State
  readonly isDeleteConfirmOpen = signal<boolean>(false);
  readonly itemToDelete = signal<ClassroomTypeDto | null>(null);

  // Column Templates
  readonly nameTpl = viewChild<TemplateRef<unknown>>('nameTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    isActive: [true],
  });

  readonly columns = computed<AdminColumn<ClassroomTypeDto>[]>(() => [
    {
      key: 'name',
      headerKey: 'ADMIN.CLASSROOM_TYPES.COL_NAME',
      sortable: true,
      cellTemplate: this.nameTpl() as TemplateRef<{ $implicit: ClassroomTypeDto }>,
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
          if (items && items.length > 0) {
            this.classroomTypes.set(items);
            this.totalCount.set(items.length);
          } else {
            this.classroomTypes.set(DEFAULT_CLASSROOM_TYPES);
            this.totalCount.set(DEFAULT_CLASSROOM_TYPES.length);
          }
        },
        error: () => {
          this.classroomTypes.set(DEFAULT_CLASSROOM_TYPES);
          this.totalCount.set(DEFAULT_CLASSROOM_TYPES.length);
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
          error: (err) => {
            const msg = err?.error?.message || 'فشلت عملية تحديث نوع الفصل';
            this.toast.error(msg);
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
          error: (err) => {
            const msg = err?.error?.message || 'فشلت عملية إنشاء نوع الفصل';
            this.toast.error(msg);
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
      error: (err) => {
        const msg = err?.error?.message || 'فشلت عملية حذف نوع الفصل';
        this.toast.error(msg);
        this.isDeleteConfirmOpen.set(false);
      },
    });
  }
}
