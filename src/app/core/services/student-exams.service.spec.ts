// src/app/core/services/student-exams.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentExamsService } from './student-exams.service';

describe('StudentExamsService', () => {
  let service: StudentExamsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentExamsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow filtering exams', () => {
    service.selectedFilter.set('completed');
    expect(service.selectedFilter()).toBe('completed');
  });
});
