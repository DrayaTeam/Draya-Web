// src/app/core/services/student-library.service.ts

import { Injectable, computed, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import { LibraryBookItem, StudentMaterialsPagedResponse } from '../models/student-library.model';

const DEFAULT_BOOKS: LibraryBookItem[] = [
  {
    id: 'book-1',
    title: 'رياضيات الصف الثالث الثانوي — الميكانيكا والتفاضل',
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
    materialType: 'Document',
  },
  {
    id: 'book-2',
    title: 'الفيزياء الحديثة — شرح الكهرومغناطيسية والفيزياء الذرية',
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
    materialType: 'Document',
  },
  {
    id: 'book-3',
    title: 'كيمياء عضوية متقدمة لطلبة الثانوية العامة',
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
    materialType: 'Document',
  },
  {
    id: 'book-4',
    title: 'المراجعة النهائية الشاملة — أسئلة ونماذج الوزارة',
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
    materialType: 'Document',
  },
];

@Injectable({
  providedIn: 'root',
})
export class StudentLibraryService extends ApiBaseService {
  readonly searchQuery = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly selectedFilter = signal<'ALL' | 'Document' | 'Video'>('ALL');

  readonly books = signal<readonly LibraryBookItem[]>(DEFAULT_BOOKS);

  readonly filteredBooks = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.selectedFilter();

    return this.books().filter((book) => {
      const matchQuery =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.subjectName.toLowerCase().includes(query);
      const matchFilter =
        filter === 'ALL' ||
        (filter === 'Video' && book.materialType === 'Video') ||
        (filter === 'Document' && (book.materialType === 'Document' || book.fileFormat === 'PDF'));
      return matchQuery && matchFilter;
    });
  });

  constructor() {
    super();
    this.loadEnrolledMaterials().subscribe();
  }

  loadEnrolledMaterials(page = 1, pageSize = 20): Observable<readonly LibraryBookItem[]> {
    this.loading.set(true);

    return this.get<StudentMaterialsPagedResponse>(
      `/students/materials?page=${page}&pageSize=${pageSize}`,
    ).pipe(
      map((res) => {
        if (!res || !res.items || res.items.length === 0) {
          return DEFAULT_BOOKS;
        }

        const mapped: LibraryBookItem[] = res.items.map((item, index) => {
          const isVideo = item.materialType === 'Video';
          const fileFormat = isVideo ? 'MP4' : 'PDF';
          const tagBg = isVideo
            ? '#AD46FF'
            : item.materialType === 'Document'
              ? '#00BC7D'
              : '#00A6F4';

          const covers = [
            'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop',
          ];

          return {
            id: item.materialId || `mat-${index}`,
            title: item.title,
            subjectName: isVideo
              ? 'فيديو تعليمي'
              : item.materialType === 'Document'
                ? 'مذكرة دراسية'
                : 'مادة تعليمية',
            subjectTagBgColor: tagBg,
            coverImageUrl: covers[index % covers.length],
            pagesCount: isVideo ? 1 : 45,
            totalPages: isVideo ? 1 : 45,
            fileSizeMb: isVideo ? 45.2 : 6.8,
            fileFormat,
            downloadUrl: item.currentVersion?.fileUrl || '#',
            chapters: [],
            materialType: item.materialType,
            uploadedAt: item.currentVersion?.uploadedAt || item.createdAt,
          };
        });

        return mapped;
      }),
      tap((loaded) => {
        this.books.set(loaded.length > 0 ? loaded : DEFAULT_BOOKS);
        this.loading.set(false);
      }),
      catchError(() => {
        // Fallback to default books on offline or 404
        this.books.set(DEFAULT_BOOKS);
        this.loading.set(false);
        return of(DEFAULT_BOOKS);
      }),
    );
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setFilter(filter: 'ALL' | 'Document' | 'Video'): void {
    this.selectedFilter.set(filter);
  }
}
