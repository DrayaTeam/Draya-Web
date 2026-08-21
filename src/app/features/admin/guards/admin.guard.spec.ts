import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../../auth/services/auth.service';
import { signal } from '@angular/core';
import { User } from '../../../core/models/user.model';

describe('adminGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;
  let currentUserSignal: ReturnType<typeof signal<User | null>>;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = { url: '/admin/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {
    currentUserSignal = signal<User | null>(null);
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: currentUserSignal.asReadonly(),
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: Router,
          useValue: {
            createUrlTree: jasmine
              .createSpy('createUrlTree')
              .and.callFake((path: string[]) => ({ url: path.join('/') }) as unknown as UrlTree),
          },
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('should allow access if user is Admin', () => {
    currentUserSignal.set({
      userId: 'u-1',
      fullName: 'Admin User',
      email: 'admin@draya.edu.sa',
      role: 'Admin',
    });

    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));
    expect(result).toBeTrue();
  });

  it('should allow access if user is SuperAdmin', () => {
    currentUserSignal.set({
      userId: 'u-2',
      fullName: 'SuperAdmin User',
      email: 'super@draya.edu.sa',
      role: 'SuperAdmin',
    });

    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));
    expect(result).toBeTrue();
  });

  it('should redirect to /auth/login if user is Student', () => {
    currentUserSignal.set({
      userId: 'u-3',
      fullName: 'Student User',
      email: 'student@draya.edu.sa',
      role: 'Student',
    });

    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect((result as unknown as { url: string }).url).toBe('/auth/login');
  });

  it('should redirect to /auth/login if user is not authenticated', () => {
    currentUserSignal.set(null);

    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect((result as unknown as { url: string }).url).toBe('/auth/login');
  });
});
