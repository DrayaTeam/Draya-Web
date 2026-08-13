// src/app/features/student/library/student-library.component.ts

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentLibraryService } from '../../../core/services/student-library.service';
import { ToastService } from '../../../core/services/toast.service';
import { BookCardComponent } from './components/book-card/book-card.component';
import { LibraryBookItem } from '../../../core/models/student-library.model';

@Component({
  selector: 'app-student-library',
  standalone: true,
  imports: [CommonModule, FormsModule, BookCardComponent],
  templateUrl: './student-library.component.html',
  styleUrl: './student-library.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentLibraryComponent {
  protected readonly libraryService = inject(StudentLibraryService);
  private readonly toastService = inject(ToastService);

  readonly books = this.libraryService.filteredBooks;

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.libraryService.setSearchQuery(value);
  }

  onDownload(book: LibraryBookItem): void {
    this.toastService.info(
      'تحميل الملف',
      `جاري بدء تحميل كتاب: ${book.title} (بحجم ${book.fileSizeMb} MB)`
    );
  }

  onPreview(book: LibraryBookItem): void {
    this.toastService.info(
      'معاينة الكتاب',
      `جاري فتح المعاينة السريعة لكتاب: ${book.title}`
    );
  }
}
