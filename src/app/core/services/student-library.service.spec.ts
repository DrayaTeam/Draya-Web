// src/app/core/services/student-library.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentLibraryService } from './student-library.service';

describe('StudentLibraryService', () => {
  let service: StudentLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), StudentLibraryService],
    });
    service = TestBed.inject(StudentLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial books', () => {
    expect(service.books().length).toBeGreaterThanOrEqual(4);
  });

  it('should filter books by search query', () => {
    service.setSearchQuery('فيزياء');
    expect(service.filteredBooks().length).toBeGreaterThanOrEqual(1);
    expect(service.filteredBooks()[0].title).toContain('الفيزياء');
  });

  it('should return all books when search query is empty', () => {
    service.setSearchQuery('');
    expect(service.filteredBooks().length).toBeGreaterThanOrEqual(4);
  });
});
