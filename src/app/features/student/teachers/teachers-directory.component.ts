import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TeacherDirectoryService } from '../../../core/services/teacher-directory.service';
import { TeacherFilterComponent } from './components/teacher-filter/teacher-filter.component';
import { TeacherCardComponent } from './components/teacher-card/teacher-card.component';
import { TeacherDirectoryItem, TeacherSubjectCategory } from '../../../core/models/teacher.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'draya-teachers-directory',
  standalone: true,
  imports: [TranslatePipe, TeacherFilterComponent, TeacherCardComponent],
  templateUrl: './teachers-directory.component.html',
  styleUrl: './teachers-directory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeachersDirectoryComponent implements OnInit {
  private readonly router = inject(Router);
  readonly teacherService = inject(TeacherDirectoryService);
  private readonly toastService = inject(ToastService);

  readonly loading = this.teacherService.loading;
  readonly skeletonCards = [1, 2, 3, 4, 5, 6];
  readonly searchQuery = this.teacherService.searchQuery;
  readonly selectedCategory = this.teacherService.selectedCategory;
  readonly filteredTeachers = this.teacherService.filteredTeachers;
  readonly subjectOptions = this.teacherService.subjectOptions;

  // Pagination
  readonly pageSize = signal<number>(6);
  readonly currentPage = signal<number>(1);

  readonly totalPages = computed(() => {
    const count = this.filteredTeachers().length;
    return Math.max(1, Math.ceil(count / this.pageSize()));
  });

  readonly paginatedTeachers = computed(() => {
    const list = this.filteredTeachers();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  ngOnInit(): void {
    this.teacherService.loadTeachers();
  }

  onSearchQueryChange(query: string): void {
    this.currentPage.set(1);
    this.teacherService.setSearchQuery(query);
  }

  onCategoryChange(category: TeacherSubjectCategory): void {
    this.currentPage.set(1);
    this.teacherService.setSelectedCategory(category);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  onViewPackages(teacher: TeacherDirectoryItem): void {
    this.router.navigate(['/student/teachers', teacher.id]);
  }
}
