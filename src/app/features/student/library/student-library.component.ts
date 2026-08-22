import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  StudentLibraryService,
  resolveMaterialUrl,
} from '../../../core/services/student-library.service';
import { ToastService } from '../../../core/services/toast.service';
import { BookCardComponent } from './components/book-card/book-card.component';
import { DrayaEmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { DrayaCardSkeletonComponent } from '../../../shared/components/card-skeleton/card-skeleton.component';
import { DrayaPaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LibraryBookItem } from '../../../core/models/student-library.model';

@Component({
  selector: 'app-student-library',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BookCardComponent,
    DrayaEmptyStateComponent,
    DrayaCardSkeletonComponent,
    DrayaPaginationComponent,
  ],
  templateUrl: './student-library.component.html',
  styleUrl: './student-library.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentLibraryComponent {
  protected readonly libraryService = inject(StudentLibraryService);
  private readonly toastService = inject(ToastService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly books = this.libraryService.filteredBooks;

  // Pagination
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(8);

  readonly paginatedBooks = computed(() => {
    const list = this.books();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  constructor() {
    effect(() => {
      this.libraryService.selectedFilter();
      this.libraryService.searchQuery();
      this.currentPage.set(1);
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  // PDF / Document Preview Reader Modal State
  readonly activePreviewBook = signal<LibraryBookItem | null>(null);
  readonly previewError = signal<string | null>(null);

  // Video Streaming Modal State
  readonly activeVideoBook = signal<LibraryBookItem | null>(null);
  readonly activeVideoStreamUrl = signal<string | null>(null);
  readonly videoLoading = signal<boolean>(false);
  readonly videoError = signal<string | null>(null);

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.libraryService.setSearchQuery(value);
  }

  setFilter(filter: 'ALL' | 'Video' | 'PDF' | 'DOCX' | 'PPTX' | 'Image' | 'Document'): void {
    this.libraryService.setFilter(filter);
  }

  onDownload(book: LibraryBookItem): void {
    const fullUrl = resolveMaterialUrl(book.downloadUrl);
    if (fullUrl && fullUrl !== '#') {
      const link = document.createElement('a');
      link.href = fullUrl;
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('download', book.title || 'material');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.toastService.success('بدء تحميل الملف', `جارٍ فتح وتنزيل [${book.title}]...`);
    } else {
      this.toastService.warning('تنبيه', 'رابط تحميل الملف غير متوفر أو قيد المعالجة.');
    }
  }

  onPreview(book: LibraryBookItem): void {
    if (book.materialType === 'Video') {
      this.openVideoStream(book);
    } else {
      this.activePreviewBook.set(book);
      this.previewError.set(null);
    }
  }

  openVideoStream(book: LibraryBookItem): void {
    this.activeVideoBook.set(book);
    this.videoLoading.set(true);
    this.videoError.set(null);
    this.activeVideoStreamUrl.set(null);

    if (book.parseStatus === 'Pending') {
      this.videoError.set(
        'جاري معالجة الفيديو في السحابة (Pending Processing). سيكون متاحاً للمشاهدة فور انتهاء المعالجة من الخادم.',
      );
      this.videoLoading.set(false);
      return;
    }

    this.libraryService.getVideoStreamUrl(book.id).subscribe({
      next: (res) => {
        // Try streamUrl from stream endpoint, fallback to fileUrl, book.streamUrl, or book.downloadUrl
        const streamUrl =
          res?.streamUrl ||
          (res as { fileUrl?: string })?.fileUrl ||
          book.streamUrl ||
          (book.downloadUrl !== '#' ? book.downloadUrl : null);

        if (streamUrl) {
          if (streamUrl.toLowerCase().includes('.tmp')) {
            this.videoError.set(
              'الملف لا يزال ملفاً مؤقتاً على الخادم (.tmp) ولم يكتمل رفعه إلى مزود البث السحابي (Cloudinary) بعد.',
            );
          } else {
            const resolved = resolveMaterialUrl(streamUrl);
            this.activeVideoStreamUrl.set(resolved);
          }
        } else {
          this.videoError.set(
            'لم يتم العثور على رابط بث مباشر لهذا الفيديو من الخادم. قد يكون الفيديو قيد الرفع أو المعالجة.',
          );
        }
        this.videoLoading.set(false);
      },
      error: () => {
        const fallbackUrl = book.streamUrl || (book.downloadUrl !== '#' ? book.downloadUrl : null);
        if (fallbackUrl) {
          if (fallbackUrl.toLowerCase().includes('.tmp')) {
            this.videoError.set(
              'الملف لا يزال ملفاً مؤقتاً على الخادم (.tmp) ولم يكتمل رفعه إلى مزود البث السحابي (Cloudinary) بعد.',
            );
          } else {
            this.activeVideoStreamUrl.set(resolveMaterialUrl(fallbackUrl));
          }
        } else {
          this.videoError.set('تعذر جلب رابط بث الفيديو من الخادم.');
        }
        this.videoLoading.set(false);
      },
    });
  }

  onVideoElementError(event: Event): void {
    const currentUrl = this.activeVideoStreamUrl() || '';
    if (currentUrl.toLowerCase().includes('.tmp')) {
      this.videoError.set(
        'الملف لا يزال ملفاً مؤقتاً على الخادم (.tmp) ولم يكتمل رفعه إلى مزود البث السحابي (Cloudinary) بعد.',
      );
      return;
    }

    const videoElem = event.target as HTMLVideoElement;
    const mediaError = videoElem?.error;
    let message =
      'تعذر تشغيل الفيديو داخل المشغل المدمج (قد يكون الرابط منتهي الصلاحية أو الصيغة تتطلب مشغل خارجي).';

    if (mediaError) {
      if (mediaError.code === 2) {
        message = 'خطأ في الاتصال بالشبكة أثناء محاولة بث الفيديو.';
      } else if (mediaError.code === 3) {
        message = 'فشل في فك ترميز ملف الفيديو (Decode Error).';
      } else if (mediaError.code === 4) {
        message =
          'صيغة الفيديو أو الرابط غير مدعوم مباشرة في المتصفح أو الملف غير موجود في السحابة.';
      }
    }

    this.videoError.set(message);
  }

  closeVideoStream(): void {
    this.activeVideoBook.set(null);
    this.activeVideoStreamUrl.set(null);
    this.videoError.set(null);
  }

  closePreview(): void {
    this.activePreviewBook.set(null);
    this.previewError.set(null);
  }

  getPdfPreviewUrl(book: LibraryBookItem): SafeResourceUrl {
    const rawUrl = resolveMaterialUrl(book.downloadUrl);
    return this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
  }

  getOfficePreviewUrl(book: LibraryBookItem): SafeResourceUrl {
    const rawUrl = resolveMaterialUrl(book.downloadUrl);
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
  }

  isPdf(book: LibraryBookItem): boolean {
    return (
      book.materialType === 'PDF' ||
      book.fileFormat === 'PDF' ||
      Boolean(book.downloadUrl && book.downloadUrl.toLowerCase().endsWith('.pdf'))
    );
  }

  isImage(book: LibraryBookItem): boolean {
    return (
      book.materialType === 'Image' ||
      book.fileFormat === 'IMG' ||
      Boolean(book.downloadUrl && /\.(png|jpe?g|webp|gif|svg)$/i.test(book.downloadUrl))
    );
  }

  openExternal(url: string | null | undefined): void {
    const targetUrl = resolveMaterialUrl(url);
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  }
}
