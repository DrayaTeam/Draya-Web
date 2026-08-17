import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminProfileComponent } from './admin-profile.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AuthService } from '../../../auth';
import { signal } from '@angular/core';

describe('AdminProfileComponent', () => {
  let component: AdminProfileComponent;
  let fixture: ComponentFixture<AdminProfileComponent>;

  beforeEach(async () => {
    const mockUser = signal({
      userId: 'admin-1',
      email: 'admin@draya.com',
      fullName: 'أ. عبدالرحمن العنزي',
      phone: '01012345678',
      role: 'Admin' as const,
    });

    const spy = {
      currentUser: mockUser,
      getProfile: jasmine.createSpy('getProfile').and.returnValue(
        of({
          userId: 'admin-1',
          email: 'admin@draya.com',
          fullName: 'أ. عبدالرحمن العنزي',
          role: 'Admin' as const,
        }),
      ),
      updateLocalUser: jasmine.createSpy('updateLocalUser'),
      changePassword: jasmine.createSpy('changePassword').and.returnValue(
        of({
          success: true,
          message: 'تم تغيير كلمة المرور بنجاح',
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [AdminProfileComponent],
      providers: [
        { provide: AuthService, useValue: spy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize form with profile data', () => {
    expect(component).toBeTruthy();
    expect(component.infoForm.get('fullName')?.value).toBe('أ. عبدالرحمن العنزي');
  });

  it('should switch between info and security tabs', () => {
    expect(component.activeTab()).toBe('info');
    component.setTab('security');
    expect(component.activeTab()).toBe('security');
  });

  it('should toggle password visibility signals', () => {
    expect(component.showCurrentPass()).toBeFalse();
    component.showCurrentPass.set(true);
    expect(component.showCurrentPass()).toBeTrue();
  });
});
