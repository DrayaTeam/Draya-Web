import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminSupervisorsComponent } from './admin-supervisors.component';
import { AdminSupervisorService } from '../../services/admin-supervisor.service';
import { ToastService } from '../../../../core/services/toast.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { AdminSupervisorDto } from '../../models/admin-supervisor.model';

describe('AdminSupervisorsComponent', () => {
  let component: AdminSupervisorsComponent;
  let fixture: ComponentFixture<AdminSupervisorsComponent>;
  let supervisorServiceSpy: jasmine.SpyObj<AdminSupervisorService>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  const mockSupervisors: AdminSupervisorDto[] = [
    {
      id: 'sup-1',
      name: 'أ. عبدالرحمن العنزي',
      email: 'admin@draya.edu.sa',
      role: 'SuperAdmin',
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      isCurrentUser: true,
    },
    {
      id: 'sup-2',
      name: 'د. سارة المنصور',
      email: 'sara.mansour@draya.edu.sa',
      role: 'Admin',
      isActive: true,
      createdAt: '2024-02-01T12:30:00Z',
      isCurrentUser: false,
    },
  ];

  beforeEach(async () => {
    supervisorServiceSpy = jasmine.createSpyObj('AdminSupervisorService', [
      'getSupervisors',
      'inviteSupervisor',
      'resendInvite',
      'toggleSupervisorStatus',
    ]);
    toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    supervisorServiceSpy.getSupervisors.and.returnValue(of(mockSupervisors));
    supervisorServiceSpy.inviteSupervisor.and.returnValue(
      of({
        id: 'sup-3',
        name: 'م. خالد الدوسري',
        email: 'khalid@draya.edu.sa',
        role: 'Admin',
        isActive: true,
        createdAt: '2026-08-20T10:00:00Z',
      }),
    );
    supervisorServiceSpy.resendInvite.and.returnValue(of(void 0));
    supervisorServiceSpy.toggleSupervisorStatus.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [AdminSupervisorsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: AdminSupervisorService, useValue: supervisorServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSupervisorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the admin supervisors component', () => {
    expect(component).toBeTruthy();
  });

  it('should load supervisors on initialization', () => {
    expect(supervisorServiceSpy.getSupervisors).toHaveBeenCalled();
    expect(component.supervisors().length).toBe(2);
    expect(component.filteredSupervisors().length).toBe(2);
  });

  it('should filter supervisors by name or email query', () => {
    component.onSearch('سارة');
    expect(component.filteredSupervisors().length).toBe(1);
    expect(component.filteredSupervisors()[0].name).toContain('سارة');
  });

  it('should open and close invite modal', () => {
    component.openInviteModal();
    expect(component.isInviteModalOpen()).toBeTrue();
    expect(component.inviteForm.get('role')?.value).toBe('Admin');

    component.closeInviteModal();
    expect(component.isInviteModalOpen()).toBeFalse();
  });

  it('should send supervisor invite successfully on valid form', () => {
    component.openInviteModal();
    component.inviteForm.patchValue({
      name: 'م. خالد الدوسري',
      email: 'khalid@draya.edu.sa',
      role: 'Admin',
    });

    component.sendInvite();
    expect(supervisorServiceSpy.inviteSupervisor).toHaveBeenCalledWith({
      name: 'م. خالد الدوسري',
      email: 'khalid@draya.edu.sa',
      role: 'Admin',
    });
    expect(toastSpy.success).toHaveBeenCalledWith(
      'تم إرسال رابط الدعوة إلى البريد الإلكتروني بنجاح',
    );
    expect(component.isInviteModalOpen()).toBeFalse();
  });

  it('should resend invitation link successfully', () => {
    component.onResendInvite(mockSupervisors[1]);
    expect(supervisorServiceSpy.resendInvite).toHaveBeenCalledWith('sup-2');
    expect(toastSpy.success).toHaveBeenCalledWith(
      'تمت إعادة إرسال رابط الدعوة إلى sara.mansour@draya.edu.sa',
    );
  });

  it('should toggle supervisor active status successfully', () => {
    component.promptToggleStatus(mockSupervisors[1]);
    expect(component.isStatusConfirmOpen()).toBeTrue();
    expect(component.selectedSupervisor()).toBe(mockSupervisors[1]);

    component.onConfirmToggleStatus();
    expect(supervisorServiceSpy.toggleSupervisorStatus).toHaveBeenCalledWith('sup-2', false);
    expect(toastSpy.success).toHaveBeenCalledWith('تم تعطيل حساب المشرف');
    expect(component.isStatusConfirmOpen()).toBeFalse();
  });
});
