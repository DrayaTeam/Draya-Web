// src/app/core/signalr/signalr.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SignalRService } from './signalr.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { NotificationStoreService } from '../services/notification-store.service';
import { signal } from '@angular/core';

describe('SignalRService', () => {
  let service: SignalRService;

  const authServiceStub = {
    isAuthenticated: signal(false),
    accessToken: signal<string | null>(null),
  };

  const notificationStoreStub = {
    addNotification: jasmine.createSpy('addNotification'),
    receiveRemoteNotification: jasmine.createSpy('receiveRemoteNotification'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SignalRService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: NotificationStoreService, useValue: notificationStoreStub },
      ],
    });
    service = TestBed.inject(SignalRService);
  });

  it('should be created with Disconnected status', () => {
    expect(service).toBeTruthy();
    expect(service.status()).toBe('Disconnected');
    expect(service.showBanner()).toBeFalse();
  });
});
