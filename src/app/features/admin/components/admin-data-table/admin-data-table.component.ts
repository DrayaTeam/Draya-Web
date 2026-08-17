import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AdminColumn<T = any> {
  key: string;
  headerKey: string;
  sortable?: boolean;
  width?: string;
  cellTemplate?: TemplateRef<{ $implicit: T }>;
}

@Component({
  selector: 'draya-admin-data-table',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule],
  templateUrl: './admin-data-table.component.html',
  styleUrls: ['./admin-data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDataTableComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data = input<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns = input<AdminColumn<any>[]>([]);
  loading = input<boolean>(false);
  totalCount = input<number>(0);
  pageSize = input<number>(10);
  currentPage = input<number>(1);
  searchPlaceholderKey = input<string>('ADMIN.SHARED.SEARCH');

  readonly searchVal = signal<string>('');
  readonly skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  readonly totalPages = computed(() => {
    const size = this.pageSize();
    const count = this.totalCount();
    return size > 0 ? Math.ceil(count / size) : 1;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCellValue(row: any, key: string): unknown {
    return row && typeof row === 'object' ? (row as Record<string, unknown>)[key] : '';
  }

  pageChange = output<number>();
  sortChange = output<{ key: string; direction: 'asc' | 'desc' }>();
  rowAction = output<{ action: string; row: unknown }>();
  searchQuery = output<string>();

  sortState = signal<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((query) => {
      this.searchQuery.emit(query);
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchVal.set(value);
    this.searchSubject.next(value);
  }

  clearSearch() {
    this.searchVal.set('');
    this.searchSubject.next('');
  }

  handleSort(column: AdminColumn) {
    if (!column.sortable) return;
    const current = this.sortState();
    let direction: 'asc' | 'desc' = 'asc';

    if (current?.key === column.key && current.direction === 'asc') {
      direction = 'desc';
    }

    this.sortState.set({ key: column.key, direction });
    this.sortChange.emit({ key: column.key, direction });
  }

  nextPage() {
    if (this.currentPage() * this.pageSize() < this.totalCount()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }
}
