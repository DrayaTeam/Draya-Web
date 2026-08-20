import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['forgotPassword', 'resetPassword'], {
      isLoading: signal(false),
    });
    authServiceSpy.forgotPassword.and.returnValue(of({ message: 'Code sent' }));
    authServiceSpy.resetPassword.and.returnValue(of(void 0));

    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize on Step 1', () => {
    expect(component).toBeTruthy();
    expect(component.currentStep()).toBe(1);
    expect(component.isSuccess()).toBeFalse();
  });

  it('should submit email on Step 1, trigger forgotPassword API, and transition to Step 2', () => {
    component.emailForm.patchValue({ email: 'teacher@draya.edu.sa' });
    component.onRequestReset();

    expect(authServiceSpy.forgotPassword).toHaveBeenCalledWith('teacher@draya.edu.sa');
    expect(component.currentStep()).toBe(2);
    expect(component.resendCountdown()).toBe(60);
    expect(toastSpy.success).toHaveBeenCalled();
  });

  it('should transition back to Step 1 when user clicks change email', () => {
    component.emailForm.patchValue({ email: 'teacher@draya.edu.sa' });
    component.onRequestReset();
    expect(component.currentStep()).toBe(2);

    component.onBackToStep1();
    expect(component.currentStep()).toBe(1);
  });

  it('should submit Step 2 OTP and new password, calling resetPassword API', () => {
    component.emailForm.patchValue({ email: 'teacher@draya.edu.sa' });
    component.onRequestReset();

    component.resetForm.patchValue({
      otpCode: '123456',
      newPassword: 'Password@123',
      confirmPassword: 'Password@123',
    });

    component.onConfirmReset();

    expect(authServiceSpy.resetPassword).toHaveBeenCalledWith({
      email: 'teacher@draya.edu.sa',
      token: '123456',
      newPassword: 'Password@123',
    });
    expect(component.isSuccess()).toBeTrue();
    expect(toastSpy.success).toHaveBeenCalled();
  });

  it('should handle API error on Step 2 with incorrect OTP', () => {
    authServiceSpy.resetPassword.and.returnValue(
      throwError(() => ({ message: 'Invalid OTP code' })),
    );

    component.emailForm.patchValue({ email: 'teacher@draya.edu.sa' });
    component.onRequestReset();

    component.resetForm.patchValue({
      otpCode: '000000',
      newPassword: 'Password@123',
      confirmPassword: 'Password@123',
    });

    component.onConfirmReset();

    expect(toastSpy.error).toHaveBeenCalledWith('Invalid OTP code');
    expect(component.isSuccess()).toBeFalse();
  });
});
