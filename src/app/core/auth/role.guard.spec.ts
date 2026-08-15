// src/app/core/auth/role.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../../features/auth';
import { signal } from '@angular/core';
import { User } from '../models/user.model';

describe('roleGuard', () => {
  let router: jasmine.SpyObj<Router>;
  const currentUserSignal = signal<User | null>(null);

  beforeEach(() => {
    currentUserSignal.set(null);
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { currentUser: currentUserSignal },
        },
        { provide: Router, useValue: routerSpy },
      ],
    });

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should redirect to /auth/login if user is not logged in', () => {
    currentUserSignal.set(null);
    const mockRoute = { data: { roles: ['student'] } } as unknown as ActivatedRouteSnapshot;
    const mockState = {} as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => {
      roleGuard(mockRoute, mockState);
    });

    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should allow access if user role matches allowed roles', () => {
    currentUserSignal.set({
      userId: '1',
      email: 's@test.com',
      fullName: 'Student',
      role: 'student',
    });
    const mockRoute = { data: { roles: ['student'] } } as unknown as ActivatedRouteSnapshot;
    const mockState = {} as RouterStateSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

    expect(result).toBeTrue();
  });

  it('should redirect to student dashboard if teacher tries to access student route', () => {
    currentUserSignal.set({
      userId: '2',
      email: 't@test.com',
      fullName: 'Teacher',
      role: 'teacher',
    });
    const mockRoute = { data: { roles: ['student'] } } as unknown as ActivatedRouteSnapshot;
    const mockState = {} as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => {
      roleGuard(mockRoute, mockState);
    });

    expect(router.createUrlTree).toHaveBeenCalledWith(['/teacher/dashboard']);
  });

  it('should redirect to student dashboard if student tries to access teacher route', () => {
    currentUserSignal.set({
      userId: '1',
      email: 's@test.com',
      fullName: 'Student',
      role: 'student',
    });
    const mockRoute = {
      data: { roles: ['teacher', 'admin'] },
    } as unknown as ActivatedRouteSnapshot;
    const mockState = {} as RouterStateSnapshot;

    TestBed.runInInjectionContext(() => {
      roleGuard(mockRoute, mockState);
    });

    expect(router.createUrlTree).toHaveBeenCalledWith(['/student/dashboard']);
  });
});
