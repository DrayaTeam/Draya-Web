// src/app/core/services/subscription.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SubscriptionService } from './subscription.service';
import { environment } from '../../../environments/environment';
import { SubscriptionPlan, SubscriptionUsage } from '../models/subscription.model';

import { MessageService } from 'primeng/api';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let httpMock: HttpTestingController;

  const mockPlan: SubscriptionPlan = {
    id: 'sub-test-1',
    planName: 'Pro Plan',
    tier: 'pro',
    price: 399,
    billingCycle: 'monthly',
    status: 'active',
    renewDate: '2026-09-01',
    limits: {
      maxClassrooms: 10,
      maxStudents: 500,
      maxExamGenerations: 20,
      maxStorageMB: 10240,
    },
  };

  const mockUsage: SubscriptionUsage = {
    usedClassrooms: 8,
    maxClassrooms: 10,
    usedStudents: 420,
    maxStudents: 500,
    usedExamGenerations: 18,
    maxExamGenerations: 20,
    usedStorageMB: 5120,
    maxStorageMB: 10240,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SubscriptionService,
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(SubscriptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch current subscription plan and update plan signal', () => {
    service.getCurrentPlan().subscribe((plan) => {
      expect(plan.id).toBe('sub-test-1');
      expect(plan.tier).toBe('pro');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/subscription/current`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlan);

    expect(service.plan()?.id).toBe('sub-test-1');
  });

  it('should fetch usage data and compute percentages correctly', () => {
    service.getUsage().subscribe((usage) => {
      expect(usage.usedExamGenerations).toBe(18);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/subscription/usage`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsage);

    expect(service.usage()?.usedExamGenerations).toBe(18);
    expect(service.examGenerationsPercent()).toBe(90);
    expect(service.studentsPercent()).toBe(84);
    expect(service.classroomsPercent()).toBe(80);
    expect(service.storagePercent()).toBe(50);
  });

  it('should flag isNearLimit when a quota is >= 80%', () => {
    service.getUsage().subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/subscription/usage`);
    req.flush(mockUsage);

    expect(service.isNearLimit()).toBeTrue();
    expect(service.isAtLimit()).toBeFalse();
  });

  it('should flag isAtLimit when a quota reaches 100%', () => {
    const fullUsage: SubscriptionUsage = {
      ...mockUsage,
      usedExamGenerations: 20,
      maxExamGenerations: 20,
    };

    service.getUsage().subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/subscription/usage`);
    req.flush(fullUsage);

    expect(service.isAtLimit()).toBeTrue();
  });
});
