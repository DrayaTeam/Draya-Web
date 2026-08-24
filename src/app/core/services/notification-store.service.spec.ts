import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NotificationStoreService } from './notification-store.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { ToastService } from './toast.service';
import { signal } from '@angular/core';

const authServiceStub = {
  currentUser: signal({ userId: 'test_user_1', role: 'Student', fullName: 'Test Student' }),
  isAuthenticated: signal(true),
};

const toastServiceStub = {
  success: jasmine.createSpy('success'),
  info: jasmine.createSpy('info'),
  warning: jasmine.createSpy('warning'),
  error: jasmine.createSpy('error'),
};

describe('NotificationStoreService', () => {
  let service: NotificationStoreService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NotificationStoreService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: ToastService, useValue: toastServiceStub },
      ],
    });
    service = TestBed.inject(NotificationStoreService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and start with no fabricated notifications', () => {
    // Regression test: this used to seed two hardcoded "welcome" notifications
    // for every user, which then persisted forever (fetchNotifications() merges
    // rather than replaces) and showed up mixed in with real backend data
    // indefinitely. The store must start empty and rely on the real backend.
    expect(service).toBeTruthy();
    expect(service.notifications().length).toBe(0);
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

  it('should receive remote notification pushed via SignalR and update store', () => {
    service.receiveRemoteNotification({
      id: 'remote-1',
      title: 'Exam Graded',
      message: 'Score 95/100',
      type: 'success',
      link: '/student/reports',
      read: false,
      createdAt: new Date().toISOString(),
    });

    expect(service.notifications()[0].id).toBe('remote-1');
    expect(toastServiceStub.success).toHaveBeenCalledWith('Exam Graded', 'Score 95/100');
  });

  it('should fetch notifications from GET /api/v1/Notifications (confirmed casing)', () => {
    service.fetchNotifications(1, 10).subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('/Notifications'));
    expect(req.request.method).toBe('GET');
    req.flush({
      items: [
        {
          id: 'server-1',
          title: 'Welcome',
          message: 'Hello',
          type: 'info',
          read: false,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      totalCount: 1,
    });

    expect(service.notifications().some((n) => n.id === 'server-1')).toBeTrue();
  });

  it('should mark a notification as read and send PUT /api/v1/Notifications/{id}/read', () => {
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

    const req = httpMock.expectOne((r) => r.url.includes(`/Notifications/${id}/read`));
    expect(req.request.method).toBe('PUT');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(service.notifications()[0].read).toBeTrue();
    expect(service.unreadCount()).toBe(unreadBefore - 1);
  });

  it('should mark all notifications as read and send PUT /api/v1/Notifications/read-all', () => {
    service.markAllAsRead();

    const req = httpMock.expectOne((r) => r.url.includes('/Notifications/read-all'));
    expect(req.request.method).toBe('PUT');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(service.unreadCount()).toBe(0);
    expect(service.hasUnread()).toBeFalse();
  });

  it('should remove a notification and send DELETE /api/v1/Notifications/{id}', () => {
    service.addNotification({ title: 'Test', message: 'Msg', type: 'info' }, false);
    const id = service.notifications()[0].id;
    service.removeNotification(id);

    const req = httpMock.expectOne((r) => r.url.includes(`/Notifications/${id}`));
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(service.notifications().some((n) => n.id === id)).toBeFalse();
  });

  it('should clear all notifications and send DELETE /api/v1/Notifications', () => {
    service.clearAll();

    const req = httpMock.expectOne((r) => r.url.endsWith('/Notifications'));
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(service.notifications().length).toBe(0);
    expect(service.unreadCount()).toBe(0);
  });
});
