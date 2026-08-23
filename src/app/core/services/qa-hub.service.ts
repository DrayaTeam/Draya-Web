// src/app/core/services/qa-hub.service.ts
// Purpose: Manages the SignalR connection to /hubs/qa (Hub C).
// Joins a classroom-specific group and exposes typed signals for:
//   QuestionCreated, QuestionReplied, QuestionVoteUpdated events.
// Consumers should effect() on these signals to refresh Q&A lists without HTTP polling.
// Gated by environment.enableQaHub.

import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  HttpTransportType,
  LogLevel,
} from '@microsoft/signalr';
import { AuthService } from '../../features/auth/services/auth.service';
import { environment } from '../../../environments/environment';
import type { QaEvent } from '../models/signalr-events.model';

const RECONNECT_DELAYS_MS: number[] = [0, 2000, 5000, 10000];

@Injectable({ providedIn: 'root' })
export class QaHubService implements OnDestroy {
  private readonly authService = inject(AuthService);

  private connection: HubConnection | null = null;
  private currentClassroomId: string | null = null;

  // ─── Typed event signals ──────────────────────────────────────────────────
  private readonly _questionCreated = signal<QaEvent | null>(null);
  private readonly _questionReplied = signal<QaEvent | null>(null);
  private readonly _questionVoteUpdated = signal<QaEvent | null>(null);
  private readonly _isConnected = signal<boolean>(false);

  /** Fires when a new question is created in the joined classroom. */
  readonly questionCreated = this._questionCreated.asReadonly();

  /** Fires when a reply is posted on a question in the joined classroom. */
  readonly questionReplied = this._questionReplied.asReadonly();

  /** Fires when a vote changes on a question in the joined classroom. */
  readonly questionVoteUpdated = this._questionVoteUpdated.asReadonly();

  /** Whether the hub connection is active. */
  readonly isConnected = this._isConnected.asReadonly();

  /**
   * Connects to /hubs/qa and joins the specified classroom group.
   * Re-joining a different classroom will leave the old group and join the new one.
   */
  async joinClassroom(classroomId: string): Promise<void> {
    if (!environment.enableQaHub) {
      console.warn('[QaHubService] Hub disabled via environment config — skipping.');
      return;
    }

    // If already connected to a different classroom, leave gracefully.
    if (
      this.connection?.state === HubConnectionState.Connected &&
      this.currentClassroomId !== classroomId
    ) {
      await this.leaveClassroom();
    }

    if (this.connection?.state === HubConnectionState.Connected) {
      // Re-join new classroom group on existing connection.
      await this.joinGroup(classroomId);
      return;
    }

    const hubUrl = environment.qaHubUrl ?? '/hubs/qa';

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => this.authService.accessToken() ?? '',
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect(RECONNECT_DELAYS_MS)
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.on('QuestionCreated', (data: QaEvent) => {
      console.log('[QaHubService] QuestionCreated:', data);
      this._questionCreated.set(data);
    });

    this.connection.on('QuestionReplied', (data: QaEvent) => {
      console.log('[QaHubService] QuestionReplied:', data);
      this._questionReplied.set(data);
    });

    this.connection.on('QuestionVoteUpdated', (data: QaEvent) => {
      console.log('[QaHubService] QuestionVoteUpdated:', data);
      this._questionVoteUpdated.set(data);
    });

    this.connection.onclose(() => {
      this._isConnected.set(false);
      this.currentClassroomId = null;
    });

    try {
      await this.connection.start();
      this._isConnected.set(true);
      await this.joinGroup(classroomId);
    } catch (err) {
      console.warn('[QaHubService] Failed to connect:', err);
      this._isConnected.set(false);
    }
  }

  /** Leaves the current classroom group and disconnects the hub. */
  async leaveClassroom(): Promise<void> {
    if (!this.connection) return;
    if (this.connection.state === HubConnectionState.Connected && this.currentClassroomId) {
      try {
        await this.connection.invoke('LeaveClassroomGroup', this.currentClassroomId);
      } catch {
        // Non-fatal — backend may not implement LeaveClassroomGroup
      }
    }
    this.connection.off('QuestionCreated');
    this.connection.off('QuestionReplied');
    this.connection.off('QuestionVoteUpdated');
    try {
      await this.connection.stop();
    } catch {
      // ignore
    }
    this.connection = null;
    this.currentClassroomId = null;
    this._isConnected.set(false);
  }

  ngOnDestroy(): void {
    void this.leaveClassroom();
  }

  private async joinGroup(classroomId: string): Promise<void> {
    if (this.connection?.state !== HubConnectionState.Connected) return;
    try {
      await this.connection.invoke('JoinClassroomGroup', classroomId);
      this.currentClassroomId = classroomId;
      console.log(`[QaHubService] Joined classroom group: ${classroomId}`);
    } catch (err) {
      console.warn('[QaHubService] Failed to join group:', err);
    }
  }
}
