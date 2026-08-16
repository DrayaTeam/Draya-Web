// src/app/core/services/student-enrollment.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentEnrollmentService } from './student-enrollment.service';
import { environment } from '../../../environments/environment';

describe('StudentEnrollmentService', () => {
  let service: StudentEnrollmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StudentEnrollmentService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(StudentEnrollmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call checkout endpoint with redirectionUrl', () => {
    const classroomId = 'cls-123';
    const redirectUrl = 'https://draya.com/payment/result';

    service.checkoutClassroom(classroomId, redirectUrl).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(res.checkoutUrl).toBe('https://accept-alpha.paymob.com/checkout');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/classrooms/${classroomId}/checkout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ redirectionUrl: redirectUrl });
    req.flush({ checkoutUrl: 'https://accept-alpha.paymob.com/checkout' });
  });

  it('should call getPaymentStatus endpoint', () => {
    const transactionId = 'txn-456';

    service.getPaymentStatus(transactionId).subscribe((statusDto) => {
      expect(statusDto).toBeTruthy();
      expect(statusDto?.status).toBe('Completed');
      expect(statusDto?.isEnrolled).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/payments/${transactionId}/status`);
    expect(req.request.method).toBe('GET');
    req.flush({
      paymentTransactionId: transactionId,
      status: 'Completed',
      grossAmount: 400,
      purpose: 'ClassroomEnrollment',
      classroomId: 'cls-123',
      isEnrolled: true,
    });
  });
});
