// src/app/features/student/library/student-library.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentLibraryComponent } from './student-library.component';
import { ToastService } from '../../../core/services/toast.service';
import { MessageService } from 'primeng/api';

describe('StudentLibraryComponent', () => {
  let component: StudentLibraryComponent;
  let fixture: ComponentFixture<StudentLibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentLibraryComponent],
      providers: [MessageService, ToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render main title and search bar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.main-title')?.textContent).toContain('مكتبة المذكرات والكتب الدراسية');
    expect(compiled.querySelector('.search-input')).toBeTruthy();
  });

  it('should render 4 book cards initially', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-book-card');
    expect(cards.length).toBe(4);
  });

  it('should trigger toast on download click', () => {
    const toastService = TestBed.inject(ToastService);
    spyOn(toastService, 'info');

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
    });

    expect(toastService.info).toHaveBeenCalledWith(
      'تحميل الملف',
      'جاري بدء تحميل كتاب: رياضيات (بحجم 5 MB)'
    );
  });
});
