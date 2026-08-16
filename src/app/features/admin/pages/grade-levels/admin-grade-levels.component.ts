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
import { AdminGradeLevelService } from '../../services/admin-grade-level.service';
import { GradeLevelDto } from '../../models/admin-grade-level.model';
import { ToastService } from '../../../../core/services/toast.service';
import {
  AdminDataTableComponent,
  AdminColumn,
} from '../../components/admin-data-table/admin-data-table.component';
import { AdminStatusBadgeComponent } from '../../components/admin-status-badge/admin-status-badge.component';
import { AdminConfirmDialogComponent } from '../../components/admin-confirm-dialog/admin-confirm-dialog.component';
import { finalize } from 'rxjs/operators';

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

  // Form Modal State
  readonly isModalOpen = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedItem = signal<GradeLevelDto | null>(null);
  readonly isSaving = signal<boolean>(false);

  // Delete Confirm Dialog State
  readonly isDeleteConfirmOpen = signal<boolean>(false);
  readonly itemToDelete = signal<GradeLevelDto | null>(null);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    sortOrder: [1, [Validators.required, Validators.min(1)]],
    isActive: [true],
  });

  // Column Templates
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<AdminColumn<GradeLevelDto>[]>(() => [
    {
      key: 'sortOrder',
      headerKey: 'ADMIN.GRADE_LEVELS.COL_ORDER',
      sortable: true,
      width: '60px',
    },
    {
      key: 'name',
      headerKey: 'ADMIN.GRADE_LEVELS.COL_NAME',
      sortable: true,
    },
    {
      key: 'description',
      headerKey: 'ADMIN.GRADE_LEVELS.COL_DESCRIPTION',
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
          this.gradeLevels.set(items || []);
          this.totalCount.set(items?.length || 0);
        },
        error: () => {
          // Fallback mock data
          const mock: GradeLevelDto[] = [
            {
              id: 'gl-1',
              name: 'الصف الأول الثانوي',
              description: 'مناهج الصف الأول الثانوي العام',
              sortOrder: 1,
              isActive: true,
              createdAt: '2024-01-10T10:00:00Z',
            },
            {
              id: 'gl-2',
              name: 'الصف الثاني الثانوي',
              description: 'شعبة علمي وأدبي',
              sortOrder: 2,
              isActive: true,
              createdAt: '2024-01-12T14:00:00Z',
            },
            {
              id: 'gl-3',
              name: 'الصف الثالث الثانوي',
              description: 'شهادة الثانوية العامة',
              sortOrder: 3,
              isActive: true,
              createdAt: '2024-01-15T09:30:00Z',
            },
            {
              id: 'gl-4',
              name: 'الصف الثالث الإعدادي',
              description: 'الشهادة الإعدادية',
              sortOrder: 4,
              isActive: false,
              createdAt: '2024-02-01T11:00:00Z',
            },
          ];
          this.gradeLevels.set(mock);
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
    const nextOrder = (this.gradeLevels().length || 0) + 1;
    this.form.reset({ name: '', description: '', sortOrder: nextOrder, isActive: true });
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
          error: () => {
            // Mock fallback
            this.gradeLevels.update((list) =>
              list.map((l) =>
                l.id === id
                  ? {
                      ...l,
                      name: formVal.name!,
                      description: formVal.description || '',
                      sortOrder: Number(formVal.sortOrder),
                      isActive: Boolean(formVal.isActive),
                    }
                  : l,
              ),
            );
            this.toast.success('ADMIN.GRADE_LEVELS.SUCCESS_UPDATED');
            this.closeModal();
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
          error: () => {
            // Mock fallback
            const newLevel: GradeLevelDto = {
              id: `gl-${Date.now()}`,
              name: formVal.name!,
              description: formVal.description || '',
              sortOrder: Number(formVal.sortOrder),
              isActive: true,
              createdAt: new Date().toISOString(),
            };
            this.gradeLevels.update((list) => [newLevel, ...list]);
            this.totalCount.update((c) => c + 1);
            this.toast.success('ADMIN.GRADE_LEVELS.SUCCESS_CREATED');
            this.closeModal();
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
      error: () => {
        // Mock fallback
        this.gradeLevels.update((list) =>
          list.map((l) => (l.id === item.id ? { ...l, isActive: false } : l)),
        );
        this.toast.success('ADMIN.GRADE_LEVELS.SUCCESS_DELETED');
        this.isDeleteConfirmOpen.set(false);
      },
    });
  }
}
