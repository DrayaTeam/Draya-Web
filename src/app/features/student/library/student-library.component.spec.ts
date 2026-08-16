// src/app/features/student/library/student-library.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentLibraryComponent } from './student-library.component';
import { StudentLibraryService } from '../../../core/services/student-library.service';
import { ToastService } from '../../../core/services/toast.service';
import { MessageService } from 'primeng/api';

describe('StudentLibraryComponent', () => {
  let component: StudentLibraryComponent;
  let fixture: ComponentFixture<StudentLibraryComponent>;
  let libraryService: StudentLibraryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentLibraryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        ToastService,
        StudentLibraryService,
      ],
    }).compileComponents();

    libraryService = TestBed.inject(StudentLibraryService);
    libraryService.loading.set(false);

    fixture = TestBed.createComponent(StudentLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render page title and search bar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.main-title')?.textContent).toContain(
      'مكتبة المذكرات والمحتوى الدراسي',
    );
    expect(compiled.querySelector('.search-input')).toBeTruthy();
  });

  it('should render book cards when loaded', () => {
    libraryService.loading.set(false);
    libraryService.books.set([
      {
        id: 'b1',
        title: 'مذكرة الرياضيات',
        subjectName: 'رياضيات',
        subjectTagBgColor: '#00A6F4',
        coverImageUrl: 'https://example.com/cover.png',
        pagesCount: 50,
        fileSizeMb: 5,
        fileFormat: 'PDF',
        downloadUrl: 'https://example.com/math.pdf',
        chapters: [],
      },
    ]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-book-card');
    expect(cards.length).toBe(1);
  });

  it('should open video modal when previewing a video material', () => {
    component.onPreview({
      id: 'mat-2',
      title: 'فيديو شرح الكيمياء',
      subjectName: 'كيمياء',
      subjectTagBgColor: '#AD46FF',
      coverImageUrl: '#',
      pagesCount: 1,
      fileSizeMb: 45,
      fileFormat: 'MP4',
      downloadUrl: '#',
      chapters: [],
      materialType: 'Video',
      streamUrl: 'https://res.cloudinary.com/demo/sample.mp4',
    });

    expect(component.activeVideoBook()?.title).toBe('فيديو شرح الكيمياء');
    expect(component.activePreviewBook()).toBeNull();
  });

  it('should open PDF modal when previewing a PDF document', () => {
    component.onPreview({
      id: 'mat-1',
      title: 'مذكرة الرياضيات',
      subjectName: 'رياضيات',
      subjectTagBgColor: '#00A6F4',
      coverImageUrl: '#',
      pagesCount: 50,
      fileSizeMb: 5,
      fileFormat: 'PDF',
      downloadUrl: 'https://example.com/math.pdf',
      chapters: [],
      materialType: 'PDF',
    });

    expect(component.activePreviewBook()?.title).toBe('مذكرة الرياضيات');
    expect(component.activeVideoBook()).toBeNull();
  });

  it('should trigger toast on download click with valid url', () => {
    const toastService = TestBed.inject(ToastService);
    spyOn(toastService, 'success');

    component.onDownload({
      id: 'b1',
      title: 'رياضيات',
      subjectName: 'رياضيات',
      subjectTagBgColor: '#00A6F4',
      coverImageUrl: '#',
      pagesCount: 100,
      fileSizeMb: 5,
      fileFormat: 'PDF',
      downloadUrl: 'https://example.com/math.pdf',
      chapters: [],
    });

    expect(toastService.success).toHaveBeenCalledWith(
      'بدء تحميل الملف',
      'جارٍ فتح وتنزيل [رياضيات]...',
    );
  });
});
