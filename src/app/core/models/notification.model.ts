// src/app/core/models/notification.model.ts
// Purpose: Core model for notifications in the Draya platform.

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly type: NotificationType;
  readonly createdAt: string; // ISO 8601 string
  readonly read: boolean;
  readonly link?: string; // Optional router link (e.g. '/student/reports')
  readonly metadata?: Record<string, unknown>;
}

export type CreateNotificationPayload = Omit<AppNotification, 'id' | 'createdAt' | 'read'>;

export interface PaginatedNotificationsResponse {
  readonly items: AppNotification[];
  readonly unreadCount: number;
  readonly totalCount: number;
}
