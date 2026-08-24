import { Injectable, inject, DestroyRef, signal, computed } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../features/auth/services/auth.service';
import { environment } from '../../../../environments/environment';

export interface TeacherNotificationItem {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: 'report' | 'risk' | 'material';
}

@Injectable({ providedIn: 'root' })
export class TeacherNotificationsService {
  private readonly auth = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  private reportsConnection: HubConnection | null = null;
  private materialsConnection: HubConnection | null = null;

  private readonly _notifications = signal<TeacherNotificationItem[]>([]);
  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = computed(() => this._notifications().filter((n) => !n.read).length);

  markAllAsRead(): void {
    this._notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  addNotification(type: 'report' | 'risk' | 'material', title: string, message: string): void {
    const newNotif: TeacherNotificationItem = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      time: new Date(),
      read: false,
      type,
    };
    this._notifications.update((list) => [newNotif, ...list]);
  }

  startConnections(): void {
    if (!this.auth.isAuthenticated()) return;

    this.startReportsHub();
    this.startMaterialsHub();

    this.destroyRef.onDestroy(() => {
      this.stopConnections();
    });
  }

  stopConnections(): void {
    if (this.reportsConnection) {
      this.reportsConnection.stop().catch((err) => console.error(err));
      this.reportsConnection = null;
    }
    if (this.materialsConnection) {
      this.materialsConnection.stop().catch((err) => console.error(err));
      this.materialsConnection = null;
    }
  }

  private async startReportsHub(): Promise<void> {
    if (this.reportsConnection?.state === HubConnectionState.Connected) return;

    const token = this.auth.accessToken() ?? '';
    const hubUrl = environment.reportsHubUrl || '/hubs/reports';

    this.reportsConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.reportsConnection.on('ReportGenerated', () => {
      this.addNotification(
        'report',
        'تقرير جديد',
        'تم إنهاء تقرير الأداء للطالب. يمكنك الآن مراجعته.',
      );
      this.messageService.add({
        severity: 'success',
        summary: 'تقرير جديد',
        detail: 'تم إنهاء تقرير الأداء للطالب. يمكنك الآن مراجعته.',
        life: 5000,
      });
    });

    this.reportsConnection.on(
      'StudentAtRisk',
      (payload: { studentId: string; topicName: string }) => {
        this.messageService.add({
          severity: 'error',
          summary: 'تنبيه: تراجع مستوى طالب',
          detail: 'تم رصد تراجع في أداء أحد الطلاب في موضوع: ' + payload.topicName + '.',
          life: 8000,
        });
      },
    );

    try {
      await this.reportsConnection.start();
      console.log('[SignalR] Connected to /hubs/reports');
    } catch (err) {
      console.warn('[SignalR] /hubs/reports connection failed:', err);
    }
  }

  private async startMaterialsHub(): Promise<void> {
    if (this.materialsConnection?.state === HubConnectionState.Connected) return;

    const token = this.auth.accessToken() ?? '';
    const hubUrl = environment.materialsHubUrl || '/hubs/materials';

    this.materialsConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.materialsConnection.on(
      'MaterialParsed',
      (payload: { materialId: string; versionId: string; status: string; message: string }) => {
        if (payload.status === 'Success') {
          this.addNotification(
            'material',
            'معالجة المادة',
            'تمت معالجة المادة التعليمية بنجاح بنظام الذكاء الاصطناعي.',
          );
          this.messageService.add({
            severity: 'success',
            summary: 'معالجة المادة',
            detail:
              'تمت معالجة المادة التعليمية بنجاح بنظام الذكاء الاصطناعي. (' +
              payload.message +
              ')',
            life: 5000,
          });
        } else {
          this.addNotification(
            'material',
            'فشل معالجة المادة',
            'حدث خطأ أثناء معالجة المادة التعليمية: ' + payload.message,
          );
          this.messageService.add({
            severity: 'error',
            summary: 'فشل معالجة المادة',
            detail: 'حدث خطأ أثناء معالجة المادة التعليمية: ' + payload.message,
            life: 8000,
          });
        }
      },
    );

    try {
      await this.materialsConnection.start();
      console.log('[SignalR] Connected to /hubs/materials');
    } catch (err) {
      console.warn('[SignalR] /hubs/materials connection failed:', err);
    }
  }
}
