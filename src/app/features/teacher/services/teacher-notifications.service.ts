import { Injectable, inject, DestroyRef } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../features/auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class TeacherNotificationsService {
  private readonly auth = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  private reportsConnection: HubConnection | null = null;
  private materialsConnection: HubConnection | null = null;

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
      this.reportsConnection.stop().catch(err => console.error(err));
      this.reportsConnection = null;
    }
    if (this.materialsConnection) {
      this.materialsConnection.stop().catch(err => console.error(err));
      this.materialsConnection = null;
    }
  }

  private async startReportsHub(): Promise<void> {
    if (this.reportsConnection?.state === HubConnectionState.Connected) return;

    const token = this.auth.accessToken() ?? '';
    const hubUrl = 'http://draya-api.runasp.net/hubs/reports';

    this.reportsConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.reportsConnection.on('ReportGenerated', (payload: { reportId: string, studentId: string }) => {
      this.messageService.add({
        severity: 'success',
        summary: 'تقرير جديد',
        detail: 'Ѫeم إنهاء تقرير الأداء للطالة. يمكنك الآن مداجعتم.',
        life: 5000
      });
    });

    this.reportsConnection.on('StudentAtRisk', (payload: { studentId: string, topicName: string }) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Ѫٝبيه: تّاجع مسѪٝوى طالب',
        detail: '٪ٕ رد تراجع خطير في أدااـ أحد الطلاب في موضوع: ' + payload.topicName + '.',
        life: 8000
      });
    });

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
    const hubUrl = 'http://draya-api.runasp.net/hubs/materials';

    this.materialsConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.materialsConnection.on('MaterialParsed', (payload: { materialId: string, versionId: string, status: string, message: string }) => {
      if (payload.status === 'Success') {
        this.messageService.add({
          severity: 'success',
          summary: 'معالجة المادة',
          detail: 'تم�� معالجة المادة التعليمية بنجاح بنظام الذكاء الاصطناعي. (' + payload.message + ')',
          life: 5000
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'فشل معالجة المادة',
          detail: 'ѭدث خطأ أثناء معالجة المادة التعليمية: ' + payload.message,
          life: 8000
        });
      }
    });

    try {
      await this.materialsConnection.start();
      console.log('[SignalR] Connected to /hubs/materials');
    } catch (err) {
      console.warn('[SignalR] /hubs/materials connection failed:', err);
    }
  }
}
