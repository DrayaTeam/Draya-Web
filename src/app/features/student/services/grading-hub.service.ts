// src/app/features/student/services/grading-hub.service.ts
// Purpose: Manages the SignalR connection to /hubs/exam-grading (Hub B).
// Connects after a student submits an exam, joins a grading-specific group,
// and streams GradingProgressUpdated events to the caller.
// Gated by environment.enableGradingHub to avoid 404s if hub is not yet live.

import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from '@microsoft/signalr';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../../environments/environment';
import type { GradingProgressEvent } from '../../../core/models/signalr-events.model';

/** Reconnect backoff intervals (ms). */
const RECONNECT_DELAYS_MS: number[] = [0, 2000, 5000, 10000];

@Injectable({ providedIn: 'root' })
export class GradingHubService implements OnDestroy {
  private readonly authService = inject(AuthService);

  private connection: HubConnection | null = null;

  private readonly _progress = signal<GradingProgressEvent | null>(null);
  private readonly _isConnected = signal<boolean>(false);

  /** Latest grading progress event from the server. */
  readonly progress = this._progress.asReadonly();

  /** Whether the hub connection is active. */
  readonly isConnected = this._isConnected.asReadonly();

  /**
   * Connects to /hubs/exam-grading and joins the specified grading group.
   * Call this immediately after receiving a `gradingJobId` from the submit-exam response.
   */
  async connect(gradingJobId: string): Promise<void> {
    if (!environment.enableGradingHub) {
      console.warn('[GradingHubService] Hub disabled via environment config — skipping.');
      return;
    }

    // Always disconnect any previous session before starting a new one.
    if (this.connection) {
      await this.disconnect();
    }

    const hubUrl = environment.gradingHubUrl ?? '/hubs/exam-grading';

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => this.authService.accessToken() ?? '',
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect(RECONNECT_DELAYS_MS)
      .configureLogging(LogLevel.Warning)
      .build();

    // Listen for grading progress updates.
    this.connection.on('GradingProgressUpdated', (data: GradingProgressEvent) => {
      if (data.gradingJobId === gradingJobId) {
        console.log('[GradingHubService] GradingProgressUpdated:', data);
        this._progress.set(data);
      }
    });

    this.connection.onclose(() => {
      this._isConnected.set(false);
    });

    try {
      await this.connection.start();
      this._isConnected.set(true);
      console.log(`[GradingHubService] Connected. Joining grading group: ${gradingJobId}`);

      // Join the specific grading group so only events for this job are received.
      await this.connection.invoke('JoinGradingGroup', gradingJobId);
    } catch (err) {
      console.warn('[GradingHubService] Failed to connect or join group:', err);
      this._isConnected.set(false);
    }
  }

  /** Disconnects from the grading hub and resets state. */
  async disconnect(): Promise<void> {
    if (this.connection) {
      if (this.connection.state !== HubConnectionState.Disconnected) {
        try {
          this.connection.off('GradingProgressUpdated');
          await this.connection.stop();
        } catch (err) {
          console.warn('[GradingHubService] Error stopping connection:', err);
        }
      }
      this.connection = null;
    }
    this._isConnected.set(false);
    this._progress.set(null);
  }

  ngOnDestroy(): void {
    void this.disconnect();
  }
}
