import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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

  it('should toggle password visibility signals', () => {
    expect(component.showPassword()).toBeFalse();
    component.toggleShowPassword();
    expect(component.showPassword()).toBeTrue();

    expect(component.showConfirmPassword()).toBeFalse();
    component.toggleShowConfirmPassword();
    expect(component.showConfirmPassword()).toBeTrue();
  });

  it('should calculate password criteria correctly', () => {
    component.resetForm.controls.newPassword.setValue('Pass123!');
    expect(component.hasMinLength()).toBeTrue();
    expect(component.hasUpperLower()).toBeTrue();
    expect(component.hasNumber()).toBeTrue();
    expect(component.hasSpecial()).toBeTrue();

    component.resetForm.controls.confirmPassword.setValue('Pass123!');
    expect(component.isMatching()).toBeTrue();

    component.resetForm.controls.confirmPassword.setValue('Different123!');
    expect(component.isMatching()).toBeFalse();
  });

  it('should clean spaces in onOtpInput', () => {
    const inputEl = document.createElement('input');
    inputEl.value = '12 34 56';
    const event = { target: inputEl } as unknown as Event;
    component.onOtpInput(event);
    expect(component.resetForm.controls.otpCode.value).toBe('123456');
  });

  it('should strip non-digit characters and cap the OTP input at 6 digits', () => {
    const inputEl = document.createElement('input');
    inputEl.value = 'ab12-34cd5678';
    const event = { target: inputEl } as unknown as Event;
    component.onOtpInput(event);
    expect(component.resetForm.controls.otpCode.value).toBe('123456');
  });

  it('should reject an OTP that is not exactly 6 digits', () => {
    component.resetForm.controls.otpCode.setValue('12345');
    expect(component.resetForm.controls.otpCode.hasError('pattern')).toBeTrue();

    component.resetForm.controls.otpCode.setValue('123456');
    expect(component.resetForm.controls.otpCode.valid).toBeTrue();
  });

  it('should resend OTP when countdown is 0', () => {
    component.emailForm.patchValue({ email: 'student@draya.edu.sa' });
    component.resendCountdown.set(0);
    component.onResendCode();

    expect(authServiceSpy.forgotPassword).toHaveBeenCalledWith('student@draya.edu.sa');
    expect(component.resendCountdown()).toBe(60);
  });

  it('should submit Step 2 OTP and new password, calling resetPassword API', fakeAsync(() => {
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

    tick(3000);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { email: 'teacher@draya.edu.sa', reset: 'success' },
    });
  }));

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
