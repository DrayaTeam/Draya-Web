import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AUTH_API, IAuthApi } from './auth-api.token';
import { of, throwError, Subject } from 'rxjs';
import { ApiError } from '../../../core/models/api-error.model';
import {
  AuthResponse,
  LoginRequest,
  RegisterTeacherRequest,
} from '../../../core/models/auth.model';
import { User } from '../../../core/models/user.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let authApiSpy: jasmine.SpyObj<IAuthApi>;

  const mockUser: User = {
    userId: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'teacher',
  };

  const mockToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiVGVhY2hlciIsImZ1bGxOYW1lIjoiVGVzdCBVc2VyIiwiZXhwIjo5OTk5OTk5OTk5fQ.signature';
  const mockAuthResponse: AuthResponse = {
    accessToken: mockToken,
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    user: mockUser,
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
      'refreshToken',
    ]);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AUTH_API, useValue: authApiSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
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
          expect(localStorage.getItem('draya_access_token')).toBe(mockToken);
          done();
        },
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
        },
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
          expect(localStorage.getItem('draya_access_token')).toBe(mockToken);
          done();
        },
      });
    });

    it('should treat a 200 response missing accessToken/refreshToken as a failure, not corrupt storage', (done) => {
      // Regression test: swagger documents POST /auth/refresh-token as
      // returning no body on 200. Silently accepting that as success used to
      // write the literal string "undefined" into localStorage instead of
      // failing the refresh loudly.
      authApiSpy.refreshToken.and.returnValue(of({} as AuthResponse));

      service.refreshToken('old-refresh-token').subscribe({
        error: () => {
          expect(localStorage.getItem('draya_access_token')).toBeNull();
          expect(service.currentUser()).toBeNull();
          done();
        },
      });
    });
  });

  describe('refresh() concurrency', () => {
    it('shares one in-flight refresh call across concurrent callers instead of racing multiple', (done) => {
      // Regression test: two 401s arriving at once used to each call
      // refreshToken() independently. If the backend rotates refresh tokens,
      // only the first of those parallel calls succeeds and the rest fail
      // and force-logout a session that was actually fine.
      // A Subject stands in for the HTTP call so both refresh() calls are
      // genuinely in flight before either resolves (a synchronous mock would
      // let the first call finish before the second even starts).
      const response$ = new Subject<AuthResponse>();
      authApiSpy.refreshToken.and.returnValue(response$);
      localStorage.setItem('draya_refresh_token', 'shared-refresh-token');

      let completed = 0;
      const onDone = () => {
        completed++;
        if (completed === 2) {
          expect(authApiSpy.refreshToken.calls.count()).toBe(1);
          done();
        }
      };

      service.refresh().subscribe({ next: onDone });
      service.refresh().subscribe({ next: onDone });
      response$.next(mockAuthResponse);
      response$.complete();
    });
  });

  describe('registration', () => {
    it('should handle registration duplicate-email (409)', (done) => {
      const apiError: ApiError = { code: 'CONFLICT', message: 'Email already exists' };
      authApiSpy.registerTeacher.and.returnValue(throwError(() => apiError));

      const payload: RegisterTeacherRequest = {
        email: 'test@example.com',
        password: 'pass',
        fullName: 'test',
        phone: '0100',
        specialization: 'Math',
        description: 'Test',
      };

      service.registerTeacher(payload).subscribe({
        error: (err) => {
          expect(err).toEqual(apiError);
          expect(service.authError()).toEqual(apiError);
          done();
        },
      });
    });

    it('should handle registration field errors (400)', (done) => {
      const apiError: ApiError = {
        code: 'VALIDATION_FAILED',
        message: 'One or more fields are invalid.',
        details: [{ field: 'email', issue: 'A valid email address is required.' }],
      };
      authApiSpy.registerTeacher.and.returnValue(throwError(() => apiError));

      const payload: RegisterTeacherRequest = {
        email: 'test',
        password: 'pass',
        fullName: 'test',
        phone: '0100',
        specialization: 'Math',
        description: 'Test',
      };

      service.registerTeacher(payload).subscribe({
        error: (err) => {
          expect(err).toEqual(apiError);
          expect(service.authError()).toEqual(apiError);
          done();
        },
      });
    });
  });
});
