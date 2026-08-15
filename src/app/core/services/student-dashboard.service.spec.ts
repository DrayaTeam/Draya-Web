// src/app/core/services/student-dashboard.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentDashboardService } from './student-dashboard.service';

describe('StudentDashboardService', () => {
  let service: StudentDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize summary signal', () => {
    const summary = service.summary();
    expect(summary).toBeTruthy();
  });
});
