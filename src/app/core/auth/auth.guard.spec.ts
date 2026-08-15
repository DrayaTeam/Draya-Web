// src/app/core/auth/auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../../features/auth';

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  it('should allow navigation if user is authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    const mockRoute = {} as ActivatedRouteSnapshot;
    const mockState = { url: '/student/dashboard' } as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBeTrue();
  });

  it('should redirect to /auth/login with returnUrl if user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const mockRoute = {} as ActivatedRouteSnapshot;
    const mockState = { url: '/student/dashboard' } as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login'], {
      queryParams: { returnUrl: '/student/dashboard' },
    });
  });
});
