import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { GenerationStatus } from '../../../core/models/exam-generation.model';

export interface GenerationProgressDto {
  generationId: string;
  status: GenerationStatus;
  examId?: string; // Present when status is Completed or CompletedWithWarning
  message?: string;
  progressPercentage?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ExamHubService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private connection: HubConnection | null = null;

  private readonly _progress = signal<GenerationProgressDto | null>(null);
  private readonly _isConnected = signal<boolean>(false);

  readonly progress = this._progress.asReadonly();
  readonly isConnected = this._isConnected.asReadonly();

  async connect(generationId: string): Promise<void> {
    if (!environment.enableExamHub) {
      console.warn('[ExamHubService] Hub connection is disabled via environment.');
      return;
    }

    if (this.connection) {
      await this.disconnect();
    }

    const hubUrl = environment.examHubUrl;

    // In dev mode, we might be hitting a proxied /hubs endpoint.
    // SignalR usually works fine with relative URLs if the proxy is configured.
    // If not, we might need to prepend window.location.origin, but relative usually works.

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => this.authService.accessToken() || '',
        transport: HttpTransportType.LongPolling, // Forced due to backend 401 on WebSockets
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.connection.on('ReceiveGenerationProgress', (progress: GenerationProgressDto) => {
      // Only process updates for the current generationId
      if (progress.generationId === generationId) {
        this._progress.set(progress);
      }
    });

    try {
      await this.connection.start();
      this._isConnected.set(true);
      console.log(`[ExamHubService] Connected. Listening for generationId: ${generationId}`);
    } catch (err) {
      console.error('[ExamHubService] Error starting SignalR connection:', err);
      this._isConnected.set(false);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        this.connection.off('ReceiveGenerationProgress');
        await this.connection.stop();
        this._isConnected.set(false);
        this._progress.set(null);
      } catch (err) {
        console.error('[ExamHubService] Error stopping SignalR connection:', err);
      }
      this.connection = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
