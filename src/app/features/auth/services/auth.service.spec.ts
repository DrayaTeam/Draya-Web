import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AUTH_API, IAuthApi } from './auth-api.token';
import { of, throwError } from 'rxjs';
import { ApiError } from '../../../core/models/api-error.model';
import { AuthResponse, LoginRequest, RegisterTeacherRequest } from '../../../core/models/auth.model';
import { User } from '../../../core/models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let authApiSpy: jasmine.SpyObj<IAuthApi>;

  const mockUser: User = {
    userId: '1',
    fullName: 'Test User',
    role: 'teacher'
    // email intentionally omitted — real API login/register/refresh responses never include it
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    user: mockUser
  };

  beforeEach(() => {
    authApiSpy = jasmine.createSpyObj('IAuthApi', [
      'login',
      'registerTeacher',
      'registerStudent',
      'logout',
      'getProfile',
      'forgotPassword',
      'resetPassword',
      'refreshToken'
    ]);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AUTH_API, useValue: authApiSpy }
      ]
    });
    
    // Clear storage before each test
    localStorage.clear();
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should handle login success', (done) => {
      authApiSpy.login.and.returnValue(of(mockAuthResponse));

      const payload: LoginRequest = { email: 'test@example.com', password: 'password' };

      service.login(payload).subscribe({
        next: (res) => {
          expect(res).toEqual(mockAuthResponse);
          expect(service.currentUser()).toEqual(mockUser);
          expect(service.authError()).toBeNull();
          expect(localStorage.getItem('draya_access_token')).toBe('access-token');
          done();
        }
      });
    });

    it('should handle login failure (401)', (done) => {
      const apiError: ApiError = { code: 'UNAUTHORIZED', message: 'Invalid credentials' };
      authApiSpy.login.and.returnValue(throwError(() => apiError));

      const payload: LoginRequest = { email: 'test@example.com', password: 'wrong' };

      service.login(payload).subscribe({
        error: (err) => {
          expect(err).toEqual(apiError);
          expect(service.authError()).toEqual(apiError);
          expect(service.currentUser()).toBeNull();
          done();
        }
      });
    });
  });

  describe('refreshToken', () => {
    it('should handle token refresh', (done) => {
      authApiSpy.refreshToken.and.returnValue(of(mockAuthResponse));

      service.refreshToken('old-refresh-token').subscribe({
        next: (res) => {
          expect(res).toEqual(mockAuthResponse);
          expect(service.currentUser()).toEqual(mockUser);
          expect(localStorage.getItem('draya_access_token')).toBe('access-token');
          done();
        }
      });
    });
  });

  describe('registration', () => {
    it('should handle registration duplicate-email (409)', (done) => {
      const apiError: ApiError = { code: 'CONFLICT', message: 'Email already exists' };
      authApiSpy.registerTeacher.and.returnValue(throwError(() => apiError));

      const payload: RegisterTeacherRequest = { email: 'test@example.com', password: 'pass', fullName: 'test', phone: '0100' };

      service.registerTeacher(payload).subscribe({
        error: (err) => {
          expect(err).toEqual(apiError);
          expect(service.authError()).toEqual(apiError);
          done();
        }
      });
    });

    it('should handle registration field errors (400)', (done) => {
      const apiError: ApiError = {
        code: 'VALIDATION_FAILED',
        message: 'One or more fields are invalid.',
        details: [{ field: 'email', issue: 'A valid email address is required.' }]
      };
      authApiSpy.registerTeacher.and.returnValue(throwError(() => apiError));

      const payload: RegisterTeacherRequest = { email: 'test', password: 'pass', fullName: 'test', phone: '0100' };

      service.registerTeacher(payload).subscribe({
        error: (err) => {
          expect(err).toEqual(apiError);
          expect(service.authError()).toEqual(apiError);
          done();
        }
      });
    });
  });
});
