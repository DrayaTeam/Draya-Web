// src/app/core/services/student-courses.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentCoursesService } from './student-courses.service';

describe('StudentCoursesService', () => {
  let service: StudentCoursesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentCoursesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should manage search query', () => {
    service.searchQuery.set('كيمياء');
    expect(service.searchQuery()).toBe('كيمياء');
  });
});
