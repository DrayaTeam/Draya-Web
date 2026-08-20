import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminSupervisorService } from './admin-supervisor.service';

describe('AdminSupervisorService', () => {
  let service: AdminSupervisorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminSupervisorService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminSupervisorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get supervisors from API', () => {
    service.getSupervisors().subscribe((list) => {
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('Admin Test');
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/supervisors'));
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 'sup-1',
        name: 'Admin Test',
        email: 'test@draya.com',
        role: 'Admin',
        isActive: true,
        createdAt: '2024-01-01',
      },
    ]);
  });

  it('should invite a new supervisor', () => {
    service
      .inviteSupervisor({ name: 'Test Supervisor', email: 'test@draya.edu.sa' })
      .subscribe((newSup) => {
        expect(newSup.name).toBe('Test Supervisor');
      });

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/supervisors/invite'));
    expect(req.request.method).toBe('POST');
    req.flush({
      id: 'sup-new',
      name: 'Test Supervisor',
      email: 'test@draya.edu.sa',
      role: 'Admin',
      isActive: true,
      createdAt: '2024-01-01',
    });
  });

  it('should resend invitation', () => {
    service.resendInvite('sup-1').subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/supervisors/sup-1/resend-invite'));
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('should toggle supervisor active state', () => {
    service.toggleSupervisorStatus('sup-1', false).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/supervisors/sup-1/status'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ isActive: false });
    req.flush(null);
  });

  it('should update admin profile', () => {
    service.updateAdminProfile({ fullName: 'New Name', phoneNumber: '01000000000' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/profile'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ fullName: 'New Name', phoneNumber: '01000000000' });
    req.flush(null);
  });

  it('should search students from API with query params', () => {
    service.getStudents({ searchTerm: 'Ahmed', page: 1, pageSize: 20 }).subscribe((res) => {
      expect(res.items.length).toBe(1);
      expect(res.items[0].fullName).toBe('Ahmed Student');
    });

    const req = httpMock.expectOne((r) => r.url.endsWith('/admin/students'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('searchTerm')).toBe('Ahmed');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('20');
    req.flush({
      items: [
        {
          userId: 'u-1',
          fullName: 'Ahmed Student',
          email: 'ahmed@student.com',
          isActive: true,
          createdAt: '2026-08-20',
        },
      ],
      pageNumber: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
    });
  });
});
