import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AcceptInviteComponent } from './accept-invite.component';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AcceptInviteComponent', () => {
  let component: AcceptInviteComponent;
  let fixture: ComponentFixture<AcceptInviteComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let router: Router;

  const mockQueryParamMap = {
    get: (key: string) => {
      if (key === 'token') return 'valid-invite-token-123';
      if (key === 'email') return 'supervisor@draya.edu.sa';
      return null;
    },
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['acceptInvite'], {
      isLoading: signal(false),
    });
    authServiceSpy.acceptInvite.and.returnValue(of(void 0));

    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [AcceptInviteComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: mockQueryParamMap,
            },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(AcceptInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create AcceptInviteComponent and read token from query params', () => {
    expect(component).toBeTruthy();
    expect(component.token).toBe('valid-invite-token-123');
    expect(component.email).toBe('supervisor@draya.edu.sa');
    expect(component.isInvalidToken()).toBeFalse();
  });

  it('should toggle show password visibility', () => {
    expect(component.showPassword()).toBeFalse();
    component.toggleShowPassword();
    expect(component.showPassword()).toBeTrue();
  });

  it('should validate form and submit supervisor credentials', () => {
    component.acceptForm.patchValue({
      fullName: 'أ. محمود الخبير',
      phone: '01012345678',
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });

    component.onSubmit();

    expect(authServiceSpy.acceptInvite).toHaveBeenCalledWith(
      jasmine.objectContaining({
        token: 'valid-invite-token-123',
        email: 'supervisor@draya.edu.sa',
        fullName: 'أ. محمود الخبير',
        phone: '01012345678',
      }),
    );
    expect(component.isSuccess()).toBeTrue();
    expect(toastSpy.success).toHaveBeenCalled();
  });

  it('should handle API error on invalid or expired token submission', () => {
    authServiceSpy.acceptInvite.and.returnValue(throwError(() => ({ message: 'Token expired' })));

    component.acceptForm.patchValue({
      fullName: 'أ. محمود الخبير',
      phone: '01012345678',
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });

    component.onSubmit();

    expect(toastSpy.error).toHaveBeenCalledWith('Token expired');
    expect(component.isSuccess()).toBeFalse();
  });
});
