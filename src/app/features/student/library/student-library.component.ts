// src/app/features/student/library/student-library.component.ts

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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

  // PDF Preview Reader Modal State
  readonly activePreviewBook = signal<LibraryBookItem | null>(null);
  readonly activePreviewPage = signal<number>(1);

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.libraryService.setSearchQuery(value);
  }

  setFilter(filter: 'ALL' | 'Document' | 'Video'): void {
    this.libraryService.setFilter(filter);
  }

  onDownload(book: LibraryBookItem): void {
    if (book.downloadUrl && book.downloadUrl !== '#') {
      window.open(book.downloadUrl, '_blank');
      this.toastService.success('بدء فتح الملف', `جارٍ فتح وتحميل [${book.title}]...`);
    } else {
      this.toastService.success(
        'بدء تحميل الملف',
        `جارٍ تحميل ملف [${book.title}] بحجم (${book.fileSizeMb} MB)...`,
      );
    }
  }

  onPreview(book: LibraryBookItem): void {
    this.activePreviewBook.set(book);
    this.activePreviewPage.set(1);
  }

  closePreview(): void {
    this.activePreviewBook.set(null);
  }

  setPreviewPage(page: number): void {
    this.activePreviewPage.set(page);
  }
}
