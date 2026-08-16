import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminClassroomTypeService } from './admin-classroom-type.service';

describe('AdminClassroomTypeService', () => {
  let service: AdminClassroomTypeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminClassroomTypeService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AdminClassroomTypeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should get all classroom types', () => {
    service.getAll().subscribe((res) => {
      expect(res.length).toBe(2);
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/classrooms/types'));
    expect(req.request.method).toBe('GET');
    req.flush([{ id: '1', name: 'Private' }, { id: '2', name: 'Group' }]);
  });

  it('should create classroom type', () => {
    service.create({ name: 'Private', description: 'One-on-one' }).subscribe((res) => {
      expect(res.name).toBe('Private');
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/classrooms/types'));
    expect(req.request.method).toBe('POST');
    req.flush({ id: '1', name: 'Private', description: 'One-on-one', isActive: true, createdAt: '' });
  });

  it('should deactivate classroom type', () => {
    service.deactivate('1').subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/classrooms/types/1'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
