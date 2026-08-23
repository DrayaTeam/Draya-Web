// src/app/features/student/services/grading-hub.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { GradingHubService } from './grading-hub.service';
import { AuthService } from '../../auth/services/auth.service';
import { signal } from '@angular/core';

// Minimal stub for AuthService
const authServiceStub = {
  accessToken: signal<string | null>('test-token'),
  isAuthenticated: signal<boolean>(true),
  currentUser: signal({ userId: 'student_123', role: 'Student' }),
};

describe('GradingHubService', () => {
  let service: GradingHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GradingHubService, { provide: AuthService, useValue: authServiceStub }],
    });
    service = TestBed.inject(GradingHubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have null progress signal initially', () => {
    expect(service.progress()).toBeNull();
  });

  it('should have false isConnected signal initially', () => {
    expect(service.isConnected()).toBeFalse();
  });

  it('should reset progress and connection on disconnect', async () => {
    // Even without a real hub, disconnect should not throw and should reset state.
    await expectAsync(service.disconnect()).toBeResolved();
    expect(service.progress()).toBeNull();
    expect(service.isConnected()).toBeFalse();
  });
});
