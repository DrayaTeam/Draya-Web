// src/app/core/services/student-courses.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { StudentCoursesService } from './student-courses.service';

describe('StudentCoursesService', () => {
  let service: StudentCoursesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentCoursesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with 2 subscribed packages matching Figma design', () => {
    const packages = service.subscribedPackages();
    expect(packages.length).toBe(2);
    expect(packages[0].subjectName).toBe('الرياضيات');
    expect(packages[1].subjectName).toBe('الكيمياء');
  });

  it('should filter packages by search query', () => {
    service.searchQuery.set('كيمياء');
    const filtered = service.filteredPackages();
    expect(filtered.length).toBe(1);
    expect(filtered[0].subjectName).toBe('الكيمياء');
  });
});
