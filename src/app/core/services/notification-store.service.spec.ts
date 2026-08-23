// src/app/core/services/notification-store.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { NotificationStoreService } from './notification-store.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { ToastService } from './toast.service';
import { signal } from '@angular/core';

const authServiceStub = {
  currentUser: signal({ userId: 'test_user_1', role: 'Student', fullName: 'Test Student' }),
};

const toastServiceStub = {
  success: jasmine.createSpy('success'),
  info: jasmine.createSpy('info'),
  warning: jasmine.createSpy('warning'),
  error: jasmine.createSpy('error'),
};

describe('NotificationStoreService', () => {
  let service: NotificationStoreService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        NotificationStoreService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: ToastService, useValue: toastServiceStub },
      ],
    });
    service = TestBed.inject(NotificationStoreService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and load initial notifications', () => {
    expect(service).toBeTruthy();
    expect(service.notifications().length).toBeGreaterThan(0);
  });

  it('should add a notification and trigger toast', () => {
    const initialCount = service.notifications().length;
    service.addNotification({
      title: 'New Exam Result',
      message: 'Your physics exam has been graded.',
      type: 'success',
      link: '/student/reports',
    });

    expect(service.notifications().length).toBe(initialCount + 1);
    expect(service.notifications()[0].title).toBe('New Exam Result');
    expect(toastServiceStub.success).toHaveBeenCalledWith(
      'New Exam Result',
      'Your physics exam has been graded.',
    );
  });

  it('should mark a notification as read and update unread count', () => {
    service.addNotification(
      {
        title: 'Unread Item',
        message: 'Some text',
        type: 'info',
      },
      false,
    );

    const unreadBefore = service.unreadCount();
    const id = service.notifications()[0].id;
    service.markAsRead(id);

    expect(service.notifications()[0].read).toBeTrue();
    expect(service.unreadCount()).toBe(unreadBefore - 1);
  });

  it('should mark all notifications as read', () => {
    service.markAllAsRead();
    expect(service.unreadCount()).toBe(0);
    expect(service.hasUnread()).toBeFalse();
  });

  it('should clear all notifications', () => {
    service.clearAll();
    expect(service.notifications().length).toBe(0);
    expect(service.unreadCount()).toBe(0);
  });
});
