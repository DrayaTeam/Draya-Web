import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
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

  ngOnInit(): void {
    this.teacherService.loadTeachers();
  }

  onSearchQueryChange(query: string): void {
    this.teacherService.setSearchQuery(query);
  }

  onCategoryChange(category: TeacherSubjectCategory): void {
    this.teacherService.setSelectedCategory(category);
  }

  onViewPackages(teacher: TeacherDirectoryItem): void {
    this.router.navigate(['/student/teachers', teacher.id]);
  }
}
