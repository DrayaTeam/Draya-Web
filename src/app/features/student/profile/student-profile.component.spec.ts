// src/app/features/student/profile/student-profile.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { StudentProfileComponent } from './student-profile.component';
import {
  StudentProfileService,
  StudentProfileData,
} from '../../../core/services/student-profile.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

describe('StudentProfileComponent', () => {
  let component: StudentProfileComponent;
  let fixture: ComponentFixture<StudentProfileComponent>;
  let profileServiceMock: jasmine.SpyObj<StudentProfileService>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;

  const mockProfile: StudentProfileData = {
    fullName: 'أحمد محمود',
    email: 'student@draya.com',
    phone: '01012345678',
    gradeLevel: 'الصف الثالث الثانوي',
    parentName: 'محمود عبد الله',
    parentPhone: '01098765432',
    parentEmail: 'parent@draya.com',
    profilePictureUrl: 'https://example.com/avatar.png',
  };

  beforeEach(async () => {
    profileServiceMock = jasmine.createSpyObj<StudentProfileService>('StudentProfileService', [
      'getProfile',
      'updateProfile',
      'uploadAvatar',
      'updatePassword',
    ]);
    profileServiceMock.getProfile.and.returnValue(of(mockProfile));
    profileServiceMock.updateProfile.and.returnValue(
      of({ success: true, message: 'تم الحفظ بنجاح' }),
    );
    profileServiceMock.uploadAvatar.and.returnValue(
      of({ success: true, message: 'تم الرفع', profilePictureUrl: 'https://example.com/new.png' }),
    );
    profileServiceMock.updatePassword.and.returnValue(
      of({ success: true, message: 'تم تغيير كلمة المرور' }),
    );

    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', [
      'currentUser',
      'updateLocalUser',
    ]);
    authServiceMock.currentUser.and.returnValue({
      userId: 'stud-1',
      fullName: 'أحمد محمود',
      email: 'student@draya.com',
      phone: '01012345678',
      role: 'student',
      parentGuardianEmail: 'parent@draya.com',
    });

    toastServiceMock = jasmine.createSpyObj<ToastService>('ToastService', [
      'success',
      'error',
      'warning',
      'info',
    ]);

    await TestBed.configureTestingModule({
      imports: [StudentProfileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: StudentProfileService, useValue: profileServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load profile data', () => {
    expect(component).toBeTruthy();
    expect(component.name).toBe('أحمد محمود');
    expect(component.parentName).toBe('محمود عبد الله');
    expect(component.parentPhone).toBe('01098765432');
    expect(component.parentEmail).toBe('parent@draya.com');
  });

  it('should switch between tabs', () => {
    expect(component.activeTab()).toBe('info');
    component.setTab('parent');
    expect(component.activeTab()).toBe('parent');
    component.setTab('security');
    expect(component.activeTab()).toBe('security');
  });

  it('should call updateProfile with parent details on save', () => {
    component.name = 'أحمد محمود المحدث';
    component.parentName = 'محمود عبد الله المحدث';
    component.parentPhone = '01011112222';
    component.parentEmail = 'updated-parent@draya.com';

    component.onSaveProfile();

    expect(profileServiceMock.updateProfile).toHaveBeenCalledWith({
      fullName: 'أحمد محمود المحدث',
      parentGuardianEmail: 'updated-parent@draya.com',
      parentGuardianName: 'محمود عبد الله المحدث',
      parentGuardianPhone: '01011112222',
      dateOfBirth: undefined,
    });
    expect(toastServiceMock.success).toHaveBeenCalled();
  });

  it('should validate password matching before updating password', () => {
    component.currentPass = 'OldPass@123';
    component.newPass = 'NewPass@123';
    component.confirmPass = 'DifferentPass@123';

    component.onUpdatePassword();

    expect(toastServiceMock.warning).toHaveBeenCalled();
    expect(profileServiceMock.updatePassword).not.toHaveBeenCalled();
  });
});
