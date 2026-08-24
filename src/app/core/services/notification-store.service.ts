// src/app/core/services/notification-store.service.ts
import { Injectable, inject, signal, computed, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiBaseService } from '../api/api-base.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { ToastService } from './toast.service';
import {
  AppNotification,
  CreateNotificationPayload,
  PaginatedNotificationsResponse,
} from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationStoreService extends ApiBaseService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  private readonly _notifications = signal<AppNotification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  readonly isLoading = signal<boolean>(false);
  readonly remoteTotalCount = signal<number>(0);

  readonly unreadCount = computed(() => this._notifications().filter((n) => !n.read).length);
  readonly hasUnread = computed(() => this.unreadCount() > 0);

  constructor() {
    super();
    const initialUser = this.auth.currentUser();
    const initialUserId = initialUser?.userId || 'guest';
    this.loadNotificationsForUser(initialUserId);

    // React to user auth state changes to reload their specific notifications & fetch remote
    effect(() => {
      const user = this.auth.currentUser();
      const userId = user?.userId || 'guest';
      this.loadNotificationsForUser(userId);
      if (this.auth.isAuthenticated() && userId !== 'guest') {
        this.fetchNotifications().subscribe();
      }
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

    // No cache yet — start empty and let fetchNotifications() populate real
    // data. Previously this seeded two hardcoded "welcome" notifications,
    // which persisted forever (fetchNotifications() merges rather than
    // replaces) and showed up mixed in with real notifications indefinitely.
    this._notifications.set([]);
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

  /**
   * Fetches historical notifications from the backend API:
   * GET /api/v1/Notifications?page={page}&pageSize={pageSize}&unreadOnly={unreadOnly}
   */
  fetchNotifications(
    page = 1,
    pageSize = 20,
    unreadOnly = false,
  ): Observable<PaginatedNotificationsResponse | null> {
    this.isLoading.set(true);
    return this.get<PaginatedNotificationsResponse>('/Notifications', {
      page,
      pageSize,
      unreadOnly,
    }).pipe(
      tap((res) => {
        this.isLoading.set(false);
        if (res?.items && Array.isArray(res.items)) {
          // Merge incoming remote items with local items (remote items take precedence)
          this._notifications.update((local) => {
            const map = new Map<string, AppNotification>();
            res.items.forEach((item) => map.set(item.id, item));
            local.forEach((item) => {
              if (!map.has(item.id)) {
                map.set(item.id, item);
              }
            });
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );
            return merged.slice(0, 50);
          });
          if (typeof res.totalCount === 'number') {
            this.remoteTotalCount.set(res.totalCount);
          }
          this.persistCurrent();
        }
      }),
      catchError(() => {
        this.isLoading.set(false);
        return of(null);
      }),
    );
  }

  /**
   * Handles incoming real-time notifications pushed via SignalR (/hubs/notifications -> ReceiveNotification).
   */
  receiveRemoteNotification(payload: AppNotification, showToast = true): void {
    if (!payload?.id) return;

    this._notifications.update((list) => {
      const filtered = list.filter((n) => n.id !== payload.id);
      return [payload, ...filtered].slice(0, 50);
    });
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

    // Sync with backend: PUT /api/v1/Notifications/{id}/read
    this.put<void>(`/Notifications/${id}/read`, {})
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  markAllAsRead(): void {
    this._notifications.update((list) => list.map((n) => ({ ...n, read: true })));
    this.persistCurrent();

    // Sync with backend: PUT /api/v1/Notifications/read-all
    this.put<void>('/Notifications/read-all', {})
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  removeNotification(id: string): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
    this.persistCurrent();

    // Sync with backend: DELETE /api/v1/Notifications/{id}
    this.delete<void>(`/Notifications/${id}`)
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  clearAll(): void {
    this._notifications.set([]);
    this.persistCurrent();

    // Sync with backend: DELETE /api/v1/Notifications
    this.delete<void>('/Notifications')
      .pipe(catchError(() => of(null)))
      .subscribe();
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
}
