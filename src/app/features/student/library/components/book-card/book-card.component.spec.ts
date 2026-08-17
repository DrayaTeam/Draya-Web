// src/app/features/student/library/components/book-card/book-card.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookCardComponent } from './book-card.component';
import { LibraryBookItem } from '../../../../../core/models/student-library.model';

describe('BookCardComponent', () => {
  let component: BookCardComponent;
  let fixture: ComponentFixture<BookCardComponent>;

  const mockBook: LibraryBookItem = {
    id: 'book-1',
    title: 'رياضيات الصف الثالث الثانوي',
    subjectName: 'رياضيات',
    subjectTagBgColor: '#00A6F4',
    coverImageUrl: 'https://example.com/cover.jpg',
    pagesCount: 312,
    fileSizeMb: 8.4,
    fileFormat: 'PDF',
    downloadUrl: '#',
    chapters: [{ id: 'ch-1', title: 'الفصل الأول' }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('book', mockBook);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render book title and subject tag', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.book-title')?.textContent).toContain('رياضيات الصف الثالث');
    expect(compiled.querySelector('.subject-tag-pill')?.textContent).toContain('رياضيات');
  });

  it('should emit download on download button click', () => {
    spyOn(component.download, 'emit');
    const btn = fixture.nativeElement.querySelector('.download-btn');
    btn.click();
    expect(component.download.emit).toHaveBeenCalledWith(mockBook);
  });
});
