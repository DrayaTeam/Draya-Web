// src/app/core/services/student-exams.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { StudentExamsService } from './student-exams.service';

describe('StudentExamsService', () => {
  let service: StudentExamsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentExamsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with 3 exams matching Figma design', () => {
    const exams = service.exams();
    expect(exams.length).toBe(3);
    expect(exams[0].status).toBe('available');
    expect(exams[1].status).toBe('scheduled');
    expect(exams[2].status).toBe('completed');
  });

  it('should filter exams by status', () => {
    service.selectedFilter.set('completed');
    const filtered = service.filteredExams();
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('امتحان الفصل الدراسي الأول التراكمي');
  });
});
