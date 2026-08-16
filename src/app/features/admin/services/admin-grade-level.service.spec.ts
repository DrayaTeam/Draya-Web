import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminGradeLevelService } from './admin-grade-level.service';

describe('AdminGradeLevelService', () => {
  let service: AdminGradeLevelService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminGradeLevelService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AdminGradeLevelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all grade levels', () => {
    service.getAll().subscribe((res) => {
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/classrooms/grade-levels'));
    expect(req.request.method).toBe('GET');
    req.flush([{ id: '1', name: 'Grade 1', sortOrder: 1, isActive: true, createdAt: '' }]);
  });

  it('should create grade level', () => {
    service.create({ name: 'Grade 1', sortOrder: 1 }).subscribe((res) => {
      expect(res.name).toBe('Grade 1');
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/classrooms/grade-levels'));
    expect(req.request.method).toBe('POST');
    req.flush({ id: '1', name: 'Grade 1', sortOrder: 1, isActive: true, createdAt: '' });
  });

  it('should deactivate grade level', () => {
    service.deactivate('1').subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/classrooms/grade-levels/1'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
