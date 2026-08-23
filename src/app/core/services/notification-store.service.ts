// src/app/core/services/notification-store.service.ts
import { Injectable, inject, signal, computed, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../features/auth/services/auth.service';
import { ToastService } from './toast.service';
import { AppNotification, CreateNotificationPayload } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationStoreService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  private readonly _notifications = signal<AppNotification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  readonly unreadCount = computed(() => this._notifications().filter((n) => !n.read).length);
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  constructor() {
    const initialUser = this.auth.currentUser();
    const initialUserId = initialUser?.userId || 'guest';
    this.loadNotificationsForUser(initialUserId);

    // React to user auth state changes to reload their specific notifications
    effect(() => {
      const user = this.auth.currentUser();
      const userId = user?.userId || 'guest';
      this.loadNotificationsForUser(userId);
    });
  }

  private getStorageKey(userId: string): string {
    return `draya_notifications_${userId}`;
  }

  private loadNotificationsForUser(userId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));
      if (raw) {
        const parsed = JSON.parse(raw) as AppNotification[];
        if (Array.isArray(parsed)) {
          this._notifications.set(parsed);
          return;
        }
      }
    } catch {
      // Fallback on parse error
    }

    // Default starter notifications if empty
    const defaults = this.getDefaultNotifications();
    this._notifications.set(defaults);
    this.saveToStorage(userId, defaults);
  }

  private saveToStorage(userId: string, items: AppNotification[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(items));
    } catch {
      // Ignore storage errors (quota, etc.)
    }
  }

  private persistCurrent(): void {
    const userId = this.auth.currentUser()?.userId || 'guest';
    this.saveToStorage(userId, this._notifications());
  }

  addNotification(payload: CreateNotificationPayload, showToast = true): void {
    const newNotif: AppNotification = {
      ...payload,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };

    this._notifications.update((list) => [newNotif, ...list].slice(0, 50)); // Keep up to 50 notifications
    this.persistCurrent();

    if (showToast) {
      if (payload.type === 'success') {
        this.toast.success(payload.title, payload.message);
      } else if (payload.type === 'error') {
        this.toast.error(payload.title, payload.message);
      } else if (payload.type === 'warning') {
        this.toast.warning(payload.title, payload.message);
      } else {
        this.toast.info(payload.title, payload.message);
      }
    }
  }

  markAsRead(id: string): void {
    this._notifications.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    this.persistCurrent();
  }

  markAllAsRead(): void {
    this._notifications.update((list) => list.map((n) => ({ ...n, read: true })));
    this.persistCurrent();
  }

  removeNotification(id: string): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
    this.persistCurrent();
  }

  clearAll(): void {
    this._notifications.set([]);
    this.persistCurrent();
  }

  getRelativeTime(isoDate: string): string {
    if (!isoDate) return '';
    try {
      const now = Date.now();
      const diffMs = now - new Date(isoDate).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'الآن';
      if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
      if (diffHours < 24) return `منذ ${diffHours} ساعة`;
      if (diffDays === 1) return 'أمس';
      return `منذ ${diffDays} أيام`;
    } catch {
      return '';
    }
  }

  private getDefaultNotifications(): AppNotification[] {
    const role = this.auth.currentUser()?.role?.toLowerCase();
    const now = new Date();

    if (role === 'teacher') {
      return [
        {
          id: 'welcome_teacher',
          title: 'مرحباً بك في درايَة!',
          message:
            'تم تفعيل حسابك كمعلم بنجاح. يمكنك الآن إنشاء باقاتك وتوليد الامتحانات بالذكاء الاصطناعي.',
          type: 'success',
          createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
          read: false,
          link: '/teacher/dashboard',
        },
        {
          id: 'tip_materials',
          title: 'توليد امتحانات ذكية',
          message: 'قم برفع مذكراتك الدراسية في المكتبة لتوليد أسئلة دقيقة مخصصة لطلابك.',
          type: 'info',
          createdAt: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
          read: true,
          link: '/teacher/library',
        },
      ];
    }

    return [
      {
        id: 'welcome_student',
        title: 'مرحباً بك في منصة درايَة!',
        message: 'ابدأ تصفح المعلمين وانضم لفصولك الدراسية لخوض الامتحانات التجريبية التفاعلية.',
        type: 'success',
        createdAt: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
        read: false,
        link: '/student/dashboard',
      },
      {
        id: 'exam_tip',
        title: 'تقارير الأداء الذكية',
        message:
          'بعد كل اختبار، سيقوم الذكاء الاصطناعي بتحديد نقاط القوة والضعف لديك لتقديم تمارين مخصصة.',
        type: 'info',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
        read: true,
        link: '/student/reports',
      },
    ];
  }
}
