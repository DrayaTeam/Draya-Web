import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrayaEmptyStateComponent } from '../empty-state/empty-state.component';

export interface Column<T = Record<string, unknown>> {
  header: string;
  accessorKey: string;
  sortable?: boolean;
  cell?: (item: T) => string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, DrayaEmptyStateComponent],
  template: `
    @if (data.length === 0) {
      <draya-empty-state
        [titleKey]="emptyTitle"
        [descriptionKey]="emptyDescription"></draya-empty-state>
    } @else {
      <div class="flex w-full flex-col gap-4">
        <div class="border-border bg-card w-full overflow-x-auto rounded-xl border">
          <table class="w-full border-collapse text-right">
            <thead>
              <tr class="border-border bg-secondary border-b">
                @for (col of columns; track col.header) {
                  <th class="text-muted-foreground p-3.5 text-xs font-bold select-none">
                    @if (col.sortable) {
                      <button
                        (click)="handleSort(col.accessorKey)"
                        class="font-inherit inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-inherit">
                        {{ col.header }}
                        <span
                          [ngClass]="[
                            'pi text-[10px]',
                            sortKey === col.accessorKey
                              ? sortOrder === 'asc'
                                ? 'pi-sort-amount-up'
                                : 'pi-sort-amount-down'
                              : 'pi-sort-alt text-muted-foreground/50',
                          ]"></span>
                      </button>
                    } @else {
                      {{ col.header }}
                    }
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              @for (item of paginatedData; track $index) {
                <tr
                  (click)="onRowClick(item)"
                  [ngClass]="[
                    'border-border border-b transition-colors duration-150',
                    rowClick.observed ? 'hover:bg-muted cursor-pointer' : '',
                  ]">
                  @for (col of columns; track col.header) {
                    <td class="text-foreground p-4 text-sm">
                      @if (col.cell) {
                        {{ col.cell(item) }}
                      } @else {
                        {{ item[col.accessorKey] }}
                      }
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination controls -->
        @if (totalPages > 1) {
          <div class="flex items-center justify-between px-2">
            <span class="text-muted-foreground text-xs">
              الصفحة {{ currentPage }} من {{ totalPages }} ({{ data.length }} عناصر إجمالاً)
            </span>
            <div class="flex gap-1.5">
              <button
                type="button"
                class="border-border bg-card text-foreground hover:bg-muted inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
                [disabled]="currentPage === 1"
                (click)="prevPage()">
                السابق
                <span class="pi pi-chevron-left text-[10px]"></span>
              </button>
              <button
                type="button"
                class="border-border bg-card text-foreground hover:bg-muted inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
                [disabled]="currentPage === totalPages"
                (click)="nextPage()">
                التالي
                <span class="pi pi-chevron-right text-[10px]"></span>
              </button>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class DataTableComponent<T extends Record<string, unknown>> implements OnChanges {
  @Input() columns: Column<T>[] = [];
  @Input() data: T[] = [];
  @Input() emptyTitle = 'لا توجد بيانات متاحة';
  @Input() emptyDescription = 'لم نجد أي سجلات حالياً.';
  @Input() pageSize = 8;

  @Output() rowClick = new EventEmitter<T>();

  sortKey: string | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';
  currentPage = 1;

  sortedData: T[] = [];
  paginatedData: T[] = [];
  totalPages = 1;

  ngOnChanges(): void {
    this.processData();
  }

  handleSort(key: string): void {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortOrder = 'asc';
    }
    this.processData();
  }

  prevPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
    this.updatePaginatedData();
  }

  nextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
    this.updatePaginatedData();
  }

  onRowClick(item: T): void {
    if (this.rowClick.observed) {
      this.rowClick.emit(item);
    }
  }

  private processData(): void {
    if (this.sortKey) {
      const key = this.sortKey;
      const order = this.sortOrder;
      this.sortedData = [...this.data].sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        if (valA === undefined || valB === undefined) return 0;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return order === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return order === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    } else {
      this.sortedData = [...this.data];
    }

    const denom = this.pageSize || 8;
    this.totalPages = Math.ceil(this.sortedData.length / denom);
    this.currentPage = Math.min(this.currentPage, this.totalPages) || 1;

    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const denom = this.pageSize || 8;
    const start = (this.currentPage - 1) * denom;
    this.paginatedData = this.sortedData.slice(start, start + denom);
  }
}
