import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { StudentPaymentCallbackComponent } from './student-payment-callback.component';
import { StudentCoursesService } from '../../../../core/services/student-courses.service';
import { StudentEnrollmentService } from '../../../../core/services/student-enrollment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PaymentStatusDto } from '../../../../core/models/payment.model';

describe('StudentPaymentCallbackComponent', () => {
  let component: StudentPaymentCallbackComponent;
  let fixture: ComponentFixture<StudentPaymentCallbackComponent>;
  let router: Router;
  let mockCoursesService: jasmine.SpyObj<StudentCoursesService>;
  let mockEnrollmentService: jasmine.SpyObj<StudentEnrollmentService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockToast: jasmine.SpyObj<ToastService>;

  const defaultMockActivatedRoute = {
    snapshot: {
      queryParams: {
        transactionId: 'txn-12345',
        status: 'success',
      },
    },
  };

  beforeEach(async () => {
    mockCoursesService = jasmine.createSpyObj('StudentCoursesService', ['loadCourses']);
    mockEnrollmentService = jasmine.createSpyObj('StudentEnrollmentService', [
      'getPaymentStatus',
      'confirmPayment',
    ]);
    mockEnrollmentService.confirmPayment.and.returnValue(of(true));
    mockAuthService = jasmine.createSpyObj('AuthService', ['currentUser']);
    mockToast = jasmine.createSpyObj('ToastService', ['success', 'error', 'info']);

    mockAuthService.currentUser.and.returnValue({
      userId: 'usr-1',
      fullName: 'أحمد علي',
      role: 'student',
      email: 'student@draya.com',
    });

    await TestBed.configureTestingModule({
      imports: [StudentPaymentCallbackComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: defaultMockActivatedRoute },
        { provide: StudentCoursesService, useValue: mockCoursesService },
        { provide: StudentEnrollmentService, useValue: mockEnrollmentService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToast },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should create component and start in verifying state then transition to completed when API returns Completed', fakeAsync(() => {
    const mockStatus: PaymentStatusDto = {
      paymentTransactionId: 'txn-12345',
      status: 'Completed',
      grossAmount: 350,
      purpose: 'ClassroomEnrollment',
      classroomId: 'cls-100',
      isEnrolled: true,
    };
    mockEnrollmentService.getPaymentStatus.and.returnValue(of(mockStatus));

    fixture = TestBed.createComponent(StudentPaymentCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockEnrollmentService.getPaymentStatus).toHaveBeenCalledWith('txn-12345');
    expect(component.verificationState()).toBe('completed');
    expect(component.grossAmount()).toBe(350);
    expect(component.targetClassroomId()).toBe('cls-100');
    expect(mockCoursesService.loadCourses).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalled();

    // Fast-forward countdown
    tick(5000);
    expect(router.navigate).toHaveBeenCalledWith(['/student/courses', 'cls-100']);
  }));

  it('should handle failed transaction status from backend', fakeAsync(() => {
    const mockStatus: PaymentStatusDto = {
      paymentTransactionId: 'txn-12345',
      status: 'Failed',
      grossAmount: 350,
      purpose: 'ClassroomEnrollment',
      isEnrolled: false,
    };
    mockEnrollmentService.getPaymentStatus.and.returnValue(of(mockStatus));

    fixture = TestBed.createComponent(StudentPaymentCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockEnrollmentService.getPaymentStatus).toHaveBeenCalledWith('txn-12345');
    expect(component.verificationState()).toBe('failed');
    expect(mockToast.error).toHaveBeenCalled();
  }));

  it('should retry when status is Pending', fakeAsync(() => {
    const pendingStatus: PaymentStatusDto = {
      paymentTransactionId: 'txn-12345',
      status: 'Pending',
      grossAmount: 350,
      isEnrolled: false,
    };
    const completedStatus: PaymentStatusDto = {
      paymentTransactionId: 'txn-12345',
      status: 'Completed',
      grossAmount: 350,
      classroomId: 'cls-100',
      isEnrolled: true,
    };

    let callCount = 0;
    mockEnrollmentService.getPaymentStatus.and.callFake(() => {
      callCount++;
      return of(callCount === 1 ? pendingStatus : completedStatus);
    });

    fixture = TestBed.createComponent(StudentPaymentCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockEnrollmentService.getPaymentStatus).toHaveBeenCalledTimes(1);

    // Advance 3 seconds for next poll attempt
    tick(3000);
    expect(mockEnrollmentService.getPaymentStatus).toHaveBeenCalledTimes(2);
    expect(component.verificationState()).toBe('completed');
  }));
});
