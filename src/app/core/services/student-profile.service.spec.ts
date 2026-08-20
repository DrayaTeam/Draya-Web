// src/app/core/services/student-profile.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StudentProfileService, UpdateStudentProfileDto } from './student-profile.service';
import { AuthService } from '../../features/auth/services/auth.service';

describe('StudentProfileService', () => {
  let service: StudentProfileService;
  let httpMock: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj<AuthService>('AuthService', [
      'currentUser',
      'updateLocalUser',
      'changePassword',
    ]);
    authServiceMock.currentUser.and.returnValue({
      userId: 'stud-1',
      fullName: 'أحمد محمود',
      email: 'student@draya.com',
      phone: '01012345678',
      role: 'student',
      parentGuardianEmail: 'parent@draya.com',
      profilePictureUrl: 'https://example.com/avatar.png',
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        StudentProfileService,
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    service = TestBed.inject(StudentProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch student profile via GET /auth/me', () => {
    service.getProfile().subscribe((profile) => {
      expect(profile.fullName).toBe('أحمد محمود');
      expect(profile.parentEmail).toBe('parent@draya.com');
      expect(profile.parentName).toBe('محمود عبد الله');
    });

    const req = httpMock.expectOne((r) => r.url.includes('/auth/me'));
    expect(req.request.method).toBe('GET');
    req.flush({
      fullName: 'أحمد محمود',
      email: 'student@draya.com',
      parentGuardianName: 'محمود عبد الله',
      parentGuardianPhone: '01098765432',
      parentGuardianEmail: 'parent@draya.com',
      profilePictureUrl: 'https://example.com/avatar.png',
    });
  });

  it('should update student profile via PUT /students/profile', () => {
    const updateDto: UpdateStudentProfileDto = {
      fullName: 'أحمد محمود الجديد',
      parentGuardianName: 'محمود عبد الله',
      parentGuardianPhone: '01098765432',
      parentGuardianEmail: 'new-parent@draya.com',
    };

    service.updateProfile(updateDto).subscribe((res) => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne((r) => r.url.includes('/students/profile'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.fullName).toBe('أحمد محمود الجديد');
    expect(req.request.body.parentGuardianName).toBe('محمود عبد الله');
    expect(req.request.body.parentGuardianPhone).toBe('01098765432');
    req.flush(null, { status: 200, statusText: 'OK' });
  });

  it('should upload avatar via POST /students/profile/picture', () => {
    const mockFile = new File(['dummy'], 'avatar.png', { type: 'image/png' });

    service.uploadAvatar(mockFile).subscribe((res) => {
      expect(res.success).toBeTrue();
      expect(res.profilePictureUrl).toBe('https://cloudinary.com/avatar.png');
    });

    const req = httpMock.expectOne((r) => r.url.includes('/students/profile/picture'));
    expect(req.request.method).toBe('POST');
    req.flush({ profilePictureUrl: 'https://cloudinary.com/avatar.png' });
  });
});
