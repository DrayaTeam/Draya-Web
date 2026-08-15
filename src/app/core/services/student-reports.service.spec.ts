// src/app/core/services/student-reports.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentReportsService } from './student-reports.service';

describe('StudentReportsService', () => {
  let service: StudentReportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have summary state', () => {
    const summary = service.summary();
    expect(summary).toBeTruthy();
  });
});
