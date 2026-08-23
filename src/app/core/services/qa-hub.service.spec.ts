// src/app/core/services/qa-hub.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { QaHubService } from './qa-hub.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { signal } from '@angular/core';

// Minimal stub for AuthService
const authServiceStub = {
  accessToken: signal<string | null>('test-token'),
  isAuthenticated: signal<boolean>(true),
};

describe('QaHubService', () => {
  let service: QaHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QaHubService,
        { provide: AuthService, useValue: authServiceStub },
      ],
    });
    service = TestBed.inject(QaHubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have null questionCreated signal initially', () => {
    expect(service.questionCreated()).toBeNull();
  });

  it('should have null questionReplied signal initially', () => {
    expect(service.questionReplied()).toBeNull();
  });

  it('should have null questionVoteUpdated signal initially', () => {
    expect(service.questionVoteUpdated()).toBeNull();
  });

  it('should have false isConnected signal initially', () => {
    expect(service.isConnected()).toBeFalse();
  });

  it('should handle leaveClassroom gracefully when not connected', async () => {
    // Should not throw even with no active connection.
    await expectAsync(service.leaveClassroom()).toBeResolved();
    expect(service.isConnected()).toBeFalse();
  });
});
