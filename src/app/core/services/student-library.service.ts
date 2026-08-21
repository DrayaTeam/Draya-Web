// src/app/core/services/student-library.service.ts

import { Injectable, computed, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  LibraryBookItem,
  MaterialStreamResponse,
  MaterialType,
  StudentMaterialItem,
  StudentMaterialsPagedResponse,
} from '../models/student-library.model';

export function resolveMaterialUrl(url: string | null | undefined): string {
  if (!url || url === '#' || url === 'null') return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  // Strip all leading slashes
  const clean = url.replace(/^\/+/, '');
  // Encode URI path segments safely (handling Arabic characters and special symbols)
  const encoded = clean
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `http://draya-api.runasp.net/${encoded}`;
}

@Injectable({
  providedIn: 'root',
})
export class StudentLibraryService extends ApiBaseService {
  readonly searchQuery = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly selectedFilter = signal<
    'ALL' | 'Video' | 'PDF' | 'DOCX' | 'PPTX' | 'Image' | 'Document'
  >('ALL');

  readonly books = signal<readonly LibraryBookItem[]>([]);

  readonly filteredBooks = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const filter = this.selectedFilter();

    return this.books().filter((book) => {
      const matchQuery =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.subjectName.toLowerCase().includes(query);

      let matchFilter = true;
      if (filter === 'Video') {
        matchFilter = book.materialType === 'Video' || book.fileFormat === 'MP4';
      } else if (filter === 'PDF') {
        matchFilter =
          book.materialType === 'PDF' ||
          book.materialType === 'Document' ||
          book.fileFormat === 'PDF';
      } else if (filter === 'DOCX') {
        matchFilter = book.materialType === 'DOCX' || book.fileFormat === 'DOCX';
      } else if (filter === 'PPTX') {
        matchFilter = book.materialType === 'PPTX' || book.fileFormat === 'PPTX';
      } else if (filter === 'Image') {
        matchFilter = book.materialType === 'Image' || book.fileFormat === 'IMG';
      } else if (filter === 'Document') {
        matchFilter =
          book.materialType === 'PDF' ||
          book.materialType === 'DOCX' ||
          book.materialType === 'PPTX' ||
          book.materialType === 'Document';
      }

      return matchQuery && matchFilter;
    });
  });

  constructor() {
    super();
    this.loadEnrolledMaterials().subscribe({
      next: () => void 0,
      error: () => void 0,
    });
  }

  /**
   * GET /api/v1/students/materials?page=1&pageSize=20
   */
  loadEnrolledMaterials(page = 1, pageSize = 20): Observable<readonly LibraryBookItem[]> {
    this.loading.set(true);

    return this.get<StudentMaterialsPagedResponse>(
      `/students/materials?page=${page}&pageSize=${pageSize}`,
    ).pipe(
      map((res) => {
        if (!res || !res.items || res.items.length === 0) {
          return [];
        }

        const mapped: LibraryBookItem[] = res.items.map((item, index) => {
          const type = (item.materialType || 'PDF') as MaterialType;
          const isVideo = type === 'Video';
          const fileFormat = isVideo
            ? 'MP4'
            : type === 'DOCX'
              ? 'DOCX'
              : type === 'PPTX'
                ? 'PPTX'
                : type === 'Image'
                  ? 'IMG'
                  : 'PDF';

          const tagBg = isVideo
            ? '#AD46FF'
            : type === 'DOCX'
              ? '#2B579A'
              : type === 'PPTX'
                ? '#D24726'
                : type === 'Image'
                  ? '#00BC7D'
                  : '#00A6F4';

          const subjectName = isVideo
            ? 'فيديو تعليمي'
            : type === 'DOCX'
              ? 'مستند Word'
              : type === 'PPTX'
                ? 'عرض تقديمي'
                : type === 'Image'
                  ? 'صورة ومخطط'
                  : 'مذكرة دراسية';

          const covers = [
            'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop',
          ];

          const rawFileUrl = item.currentVersion?.fileUrl;
          const downloadUrl = resolveMaterialUrl(rawFileUrl);

          return {
            id: item.materialId || `mat-${index}`,
            title: item.title,
            subjectName,
            subjectTagBgColor: tagBg,
            coverImageUrl: covers[index % covers.length],
            pagesCount: isVideo ? 1 : 45,
            totalPages: isVideo ? 1 : 45,
            fileSizeMb: isVideo ? 45.2 : 6.8,
            fileFormat,
            downloadUrl: downloadUrl || '#',
            chapters: [],
            materialType: type,
            parseStatus: item.currentVersion?.parseStatus || 'Parsed',
            uploadedAt: item.currentVersion?.uploadedAt || item.createdAt,
          };
        });

        return mapped;
      }),
      tap((loaded) => {
        this.books.set(loaded);
        this.loading.set(false);
      }),
      catchError(() => {
        this.books.set([]);
        this.loading.set(false);
        return of([]);
      }),
    );
  }

  /**
   * GET /api/v1/materials/{materialId}
   */
  getSingleMaterial(materialId: string): Observable<StudentMaterialItem | null> {
    return this.get<StudentMaterialItem>(`/materials/${materialId}`).pipe(
      catchError(() => of(null)),
    );
  }

  /**
   * GET /api/v1/materials/{materialId}/stream
   */
  getVideoStreamUrl(materialId: string): Observable<MaterialStreamResponse | null> {
    return this.get<MaterialStreamResponse>(`/materials/${materialId}/stream`).pipe(
      map((res) => {
        if (!res) return null;
        return {
          ...res,
          streamUrl: resolveMaterialUrl(res.streamUrl),
        };
      }),
      catchError(() => of(null)),
    );
  }

  /**
   * GET /api/v1/classrooms/{classroomId}/materials?page=1&pageSize=20
   */
  getClassroomMaterials(
    classroomId: string,
    page = 1,
    pageSize = 20,
  ): Observable<StudentMaterialItem[]> {
    return this.get<StudentMaterialItem[] | StudentMaterialsPagedResponse>(
      `/classrooms/${classroomId}/materials?page=${page}&pageSize=${pageSize}`,
    ).pipe(
      map((res) => {
        if (Array.isArray(res)) return res;
        if (res && res.items) return res.items;
        return [];
      }),
      catchError(() => of([])),
    );
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  setFilter(filter: 'ALL' | 'Video' | 'PDF' | 'DOCX' | 'PPTX' | 'Image' | 'Document'): void {
    this.selectedFilter.set(filter);
  }
}
