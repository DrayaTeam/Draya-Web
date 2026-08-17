// src/app/core/services/teacher-directory.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TeacherDirectoryService } from './teacher-directory.service';

describe('TeacherDirectoryService', () => {
  let service: TeacherDirectoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TeacherDirectoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should manage category filter', () => {
    service.setSelectedCategory('math');
    expect(service.selectedCategory()).toBe('math');
  });

  it('should manage search query', () => {
    service.setSearchQuery('سارة');
    expect(service.searchQuery()).toBe('سارة');
  });
});
