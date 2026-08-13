// src/app/core/services/teacher-directory.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { TeacherDirectoryService } from './teacher-directory.service';

describe('TeacherDirectoryService', () => {
  let service: TeacherDirectoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeacherDirectoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default 4 teachers', () => {
    const teachers = service.filteredTeachers();
    expect(teachers.length).toBe(4);
  });

  it('should filter teachers by subject category', () => {
    service.setSelectedCategory('math');
    const teachers = service.filteredTeachers();
    expect(teachers.length).toBe(1);
    expect(teachers[0].name).toBe('أ. أحمد السيد');
  });

  it('should filter teachers by search query', () => {
    service.setSearchQuery('سارة');
    const teachers = service.filteredTeachers();
    expect(teachers.length).toBe(1);
    expect(teachers[0].name).toBe('أ. سارة محمد');
  });

  it('should return empty list if search query matches nothing', () => {
    service.setSearchQuery('غير موجود');
    const teachers = service.filteredTeachers();
    expect(teachers.length).toBe(0);
  });
});
