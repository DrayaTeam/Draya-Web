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
      'مكتبة المذكرات والكتب الدراسية',
    );
    expect(compiled.querySelector('.search-input')).toBeTruthy();
  });

  it('should render book cards initially', () => {
    libraryService.loading.set(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-book-card');
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it('should trigger toast on download click', () => {
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
      downloadUrl: '#',
      chapters: [],
    });

    expect(toastService.success).toHaveBeenCalledWith(
      'بدء تحميل الملف',
      'جارٍ تحميل ملف [رياضيات] بحجم (5 MB)...',
    );
  });
});
