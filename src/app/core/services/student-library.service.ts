// src/app/core/services/student-library.service.ts

import { Injectable, computed, signal } from '@angular/core';
import { LibraryBookItem } from '../models/student-library.model';

@Injectable({
  providedIn: 'root',
})
export class StudentLibraryService {
  readonly searchQuery = signal<string>('');

  readonly books = signal<readonly LibraryBookItem[]>([
    {
      id: 'book-1',
      title: 'رياضيات الصف الثالث الثانوي',
      subjectName: 'رياضيات',
      subjectTagBgColor: '#00A6F4',
      coverImageUrl:
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop',
      pagesCount: 312,
      totalPages: 312,
      fileSizeMb: 8.4,
      fileFormat: 'PDF',
      downloadUrl: '#',
      chapters: [
        { id: 'ch1', title: '1. المصفوفات والمحددات' },
        { id: 'ch2', title: '2. الهندسة الفراغية' },
        { id: 'ch3', title: '3. التفاضل والتكامل' },
      ],
    },
    {
      id: 'book-2',
      title: 'الفيزياء الحديثة — الجزء الأول',
      subjectName: 'فيزياء',
      subjectTagBgColor: '#AD46FF',
      coverImageUrl:
        'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=600&auto=format&fit=crop',
      pagesCount: 280,
      totalPages: 280,
      fileSizeMb: 12.1,
      fileFormat: 'PDF',
      downloadUrl: '#',
      chapters: [
        { id: 'ch1', title: '1. الكهرومغناطيسية' },
        { id: 'ch2', title: '2. الفيزياء الذرية' },
        { id: 'ch3', title: '3. أشباه الموصلات' },
      ],
    },
    {
      id: 'book-3',
      title: 'كيمياء عضوية متقدمة لطلبة اللغات',
      subjectName: 'كيمياء',
      subjectTagBgColor: '#00BC7D',
      coverImageUrl:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
      pagesCount: 195,
      totalPages: 195,
      fileSizeMb: 6.7,
      fileFormat: 'PDF',
      downloadUrl: '#',
      chapters: [
        { id: 'ch1', title: '1. الهيدروكربونات الأليفاتية' },
        { id: 'ch2', title: '2. المركبات الحلقية' },
        { id: 'ch3', title: '3. البوليمرات والبروتينات' },
      ],
    },
    {
      id: 'book-4',
      title: 'المراجعة النهائية — علمي رياضة',
      subjectName: 'متنوع',
      subjectTagBgColor: '#FF2056',
      coverImageUrl:
        'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop',
      pagesCount: 120,
      totalPages: 120,
      fileSizeMb: 5.2,
      fileFormat: 'PDF',
      downloadUrl: '#',
      chapters: [
        { id: 'ch1', title: '1. ملخص القوانين الهامة' },
        { id: 'ch2', title: '2. نماذج اختبارات الوزارة' },
        { id: 'ch3', title: '3. الإجابات النموذجية' },
      ],
    },
  ]);

  readonly filteredBooks = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) {
      return this.books();
    }
    return this.books().filter(
      (book) =>
        book.title.toLowerCase().includes(query) || book.subjectName.toLowerCase().includes(query),
    );
  });

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }
}
