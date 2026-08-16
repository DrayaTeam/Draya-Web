import { TestBed } from '@angular/core/testing';
import { AdminSupervisorService } from './admin-supervisor.service';

describe('AdminSupervisorService', () => {
  let service: AdminSupervisorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminSupervisorService],
    });
    service = TestBed.inject(AdminSupervisorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get initial mock supervisors', (done) => {
    service.getSupervisors().subscribe((list) => {
      expect(list.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should invite a new supervisor', (done) => {
    service.inviteSupervisor({ name: 'Test Supervisor', email: 'test@draya.edu.sa' }).subscribe((newSup) => {
      expect(newSup.name).toBe('Test Supervisor');
      expect(newSup.email).toBe('test@draya.edu.sa');
      done();
    });
  });

  it('should toggle supervisor active state', (done) => {
    service.toggleSupervisorStatus('sup-1', false).subscribe(() => {
      service.getSupervisors().subscribe((list) => {
        const sup = list.find((s) => s.id === 'sup-1');
        expect(sup?.isActive).toBeFalse();
        done();
      });
    });
  });
});
