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
import { AdminGradeLevelService } from '../../services/admin-grade-level.service';
import { GradeLevelDto } from '../../models/admin-grade-level.model';
import {
  AdminDataTableComponent,
  AdminColumn,
} from '../../components/admin-data-table/admin-data-table.component';
import { AdminStatusBadgeComponent } from '../../components/admin-status-badge/admin-status-badge.component';
import { AdminConfirmDialogComponent } from '../../components/admin-confirm-dialog/admin-confirm-dialog.component';
import { ToastService } from '../../../../core/services/toast.service';
import { finalize } from 'rxjs/operators';

const DEFAULT_GRADE_LEVELS: GradeLevelDto[] = [
  {
    id: '1',
    name: 'الصف الأول الابتدائي',
    description: 'المرحلة الابتدائية',
    sortOrder: 1,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'الصف الثاني الابتدائي',
    description: 'المرحلة الابتدائية',
    sortOrder: 2,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'الصف الثالث الابتدائي',
    description: 'المرحلة الابتدائية',
    sortOrder: 3,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'الصف الرابع الابتدائي',
    description: 'المرحلة الابتدائية',
    sortOrder: 4,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'الصف الخامس الابتدائي',
    description: 'المرحلة الابتدائية',
    sortOrder: 5,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '6',
    name: 'الصف السادس الابتدائي',
    description: 'المرحلة الابتدائية',
    sortOrder: 6,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '7',
    name: 'الصف الأول الإعدادي',
    description: 'المرحلة الإعدادية',
    sortOrder: 7,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '8',
    name: 'الصف الثاني الإعدادي',
    description: 'المرحلة الإعدادية',
    sortOrder: 8,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '9',
    name: 'الصف الثالث الإعدادي',
    description: 'المرحلة الإعدادية',
    sortOrder: 9,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '10',
    name: 'الصف الأول الثانوي',
    description: 'المرحلة الثانوية',
    sortOrder: 10,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '11',
    name: 'الصف الثاني الثانوي',
    description: 'المرحلة الثانوية',
    sortOrder: 11,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '12',
    name: 'الصف الثالث الثانوي',
    description: 'المرحلة الثانوية (شهادة الثانوية العامة)',
    sortOrder: 12,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

@Component({
  selector: 'draya-admin-grade-levels',
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
  templateUrl: './admin-grade-levels.component.html',
  styleUrls: ['./admin-grade-levels.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminGradeLevelsComponent implements OnInit {
  private readonly gradeLevelService = inject(AdminGradeLevelService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly gradeLevels = signal<GradeLevelDto[]>([]);
  readonly loading = signal<boolean>(false);
  readonly totalCount = signal<number>(0);
  readonly searchQuery = signal<string>('');

  // Quick preset grade levels for selection
  readonly presetSuggestions = [
    'الصف الأول الثانوي',
    'الصف الثاني الثانوي',
    'الصف الثالث الثانوي',
    'الصف الأول الإعدادي',
    'الصف الثاني الإعدادي',
    'الصف الثالث الإعدادي',
    'الصف الأول الابتدائي',
    'الصف الثاني الابتدائي',
    'الصف الثالث الابتدائي',
    'الصف الرابع الابتدائي',
    'الصف الخامس الابتدائي',
    'الصف السادس الابتدائي',
  ];

  selectPreset(name: string): void {
    this.form.patchValue({ name });
  }

  // Modal State
  readonly isModalOpen = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly selectedItem = signal<GradeLevelDto | null>(null);

  // Delete State
  readonly isDeleteConfirmOpen = signal<boolean>(false);
  readonly itemToDelete = signal<GradeLevelDto | null>(null);

  // Column Templates
  readonly nameTpl = viewChild<TemplateRef<unknown>>('nameTpl');
  readonly sortTpl = viewChild<TemplateRef<unknown>>('sortTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    sortOrder: [1, [Validators.required, Validators.min(1)]],
    isActive: [true],
  });

  readonly columns = computed<AdminColumn<GradeLevelDto>[]>(() => [
    {
      key: 'name',
      headerKey: 'ADMIN.GRADE_LEVELS.COL_NAME',
      sortable: true,
      cellTemplate: this.nameTpl() as TemplateRef<{ $implicit: GradeLevelDto }>,
    },
    {
      key: 'description',
      headerKey: 'ADMIN.GRADE_LEVELS.COL_DESCRIPTION',
    },
    {
      key: 'sortOrder',
      headerKey: 'ADMIN.GRADE_LEVELS.COL_SORT_ORDER',
      sortable: true,
      cellTemplate: this.sortTpl() as TemplateRef<{ $implicit: GradeLevelDto }>,
    },
    {
      key: 'isActive',
      headerKey: 'ADMIN.GRADE_LEVELS.COL_STATUS',
      cellTemplate: this.statusTpl() as TemplateRef<{ $implicit: GradeLevelDto }>,
    },
    {
      key: 'createdAt',
      headerKey: 'ADMIN.GRADE_LEVELS.COL_CREATED_AT',
      sortable: true,
    },
    {
      key: 'actions',
      headerKey: 'ADMIN.GRADE_LEVELS.COL_ACTIONS',
      cellTemplate: this.actionsTpl() as TemplateRef<{ $implicit: GradeLevelDto }>,
    },
  ]);

  readonly filteredLevels = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.gradeLevels();
    return this.gradeLevels().filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.description && l.description.toLowerCase().includes(q)),
    );
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.gradeLevelService
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (items) => {
          if (items && items.length > 0) {
            this.gradeLevels.set(items);
            this.totalCount.set(items.length);
          } else {
            this.gradeLevels.set(DEFAULT_GRADE_LEVELS);
            this.totalCount.set(DEFAULT_GRADE_LEVELS.length);
          }
        },
        error: () => {
          this.gradeLevels.set(DEFAULT_GRADE_LEVELS);
          this.totalCount.set(DEFAULT_GRADE_LEVELS.length);
        },
      });
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.selectedItem.set(null);
    this.form.reset({
      name: '',
      description: '',
      sortOrder: (this.gradeLevels().length || 0) + 1,
      isActive: true,
    });
    this.isModalOpen.set(true);
  }

  openEditModal(item: GradeLevelDto): void {
    this.isEditMode.set(true);
    this.selectedItem.set(item);
    this.form.patchValue({
      name: item.name,
      description: item.description || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedItem.set(null);
  }

  saveLevel(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formVal = this.form.value;

    if (this.isEditMode() && this.selectedItem()) {
      const id = this.selectedItem()!.id;
      this.gradeLevelService
        .update(id, {
          name: formVal.name!,
          description: formVal.description || undefined,
          sortOrder: Number(formVal.sortOrder),
          isActive: Boolean(formVal.isActive),
        })
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => {
            this.toast.success('ADMIN.GRADE_LEVELS.SUCCESS_UPDATED');
            this.closeModal();
            this.loadData();
          },
          error: (err) => {
            const msg = err?.error?.message || 'فشلت عملية تحديث المرحلة الدراسية';
            this.toast.error(msg);
          },
        });
    } else {
      this.gradeLevelService
        .create({
          name: formVal.name!,
          description: formVal.description || undefined,
          sortOrder: Number(formVal.sortOrder),
        })
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => {
            this.toast.success('ADMIN.GRADE_LEVELS.SUCCESS_CREATED');
            this.closeModal();
            this.loadData();
          },
          error: (err) => {
            const msg = err?.error?.message || 'فشلت عملية إنشاء المرحلة الدراسية';
            this.toast.error(msg);
          },
        });
    }
  }

  promptDelete(item: GradeLevelDto): void {
    this.itemToDelete.set(item);
    this.isDeleteConfirmOpen.set(true);
  }

  onConfirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.gradeLevelService.deactivate(item.id).subscribe({
      next: () => {
        this.toast.success('ADMIN.GRADE_LEVELS.SUCCESS_DELETED');
        this.isDeleteConfirmOpen.set(false);
        this.loadData();
      },
      error: (err) => {
        const msg = err?.error?.message || 'فشلت عملية حذف المرحلة الدراسية';
        this.toast.error(msg);
        this.isDeleteConfirmOpen.set(false);
      },
    });
  }
}
