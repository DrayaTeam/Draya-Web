// src/app/features/student/teachers/components/teacher-filter/teacher-filter.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {
  SubjectFilterOption,
  TeacherSubjectCategory,
} from '../../../../../core/models/teacher.model';

@Component({
  selector: 'draya-teacher-filter',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './teacher-filter.component.html',
  styleUrl: './teacher-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherFilterComponent {
  readonly searchQuery = input<string>('');
  readonly selectedCategory = input<TeacherSubjectCategory>('all');
  readonly options = input.required<readonly SubjectFilterOption[]>();

  readonly searchChange = output<string>();
  readonly categoryChange = output<TeacherSubjectCategory>();

  onInputSearch(val: string): void {
    this.searchChange.emit(val);
  }

  onSelectCategory(category: TeacherSubjectCategory): void {
    this.categoryChange.emit(category);
  }
}
