// src/app/core/signalr/signalr.service.ts
// Purpose: Manages the @microsoft/signalr HubConnection lifecycle for the Draya notification hub.
// - Watches auth.isLoggedIn via effect() to start/stop automatically — NO circular dep.
// - Exposes typed event signals for each real-time event (US-115, CONTEXT.md §Real-Time Events).
// - Implements exponential backoff on top of withAutomaticReconnect().
// - Status signal is read-only to prevent external mutation.

import { Injectable, inject, signal, computed, effect, DestroyRef } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { AuthService } from '../../features/auth/services/auth.service';
import { environment } from '../../../environments/environment';
import type {
  MaterialParsedEvent,
  ExamGenerationCompletedEvent,
  GradingCompletedEvent,
  NewChatMessageEvent,
} from '../models/signalr-events.model';

export type ConnectionStatus =
  | 'Disconnected'
  | 'Connecting'
  | 'Reconnecting'
  | 'Connected'
  | 'Error';

/** Exponential backoff intervals (ms) for the automatic-reconnect policy. */
const RECONNECT_DELAYS_MS: number[] = [0, 2000, 5000, 10000, 30000];

@Injectable({ providedIn: 'root' })
export class SignalRService {
  // AuthService injects NO SignalRService → one-way dep, no cycle.
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private connection: HubConnection | null = null;

  // ─── Connection status ────────────────────────────────────────────────────
  private readonly _status = signal<ConnectionStatus>('Disconnected');
  /** Reactive connection status. Read-only to prevent external mutation. */
  readonly status = this._status.asReadonly();

  /** True when the connection is degraded and the user should be notified. */
  readonly showBanner = computed<boolean>(
    () =>
      this._status() === 'Disconnected' ||
      this._status() === 'Reconnecting' ||
      this._status() === 'Error',
  );

  // ─── Typed event signals ──────────────────────────────────────────────────
  private readonly _materialParsed = signal<MaterialParsedEvent | null>(null);
  readonly materialParsed = this._materialParsed.asReadonly();

  private readonly _examGenerationCompleted =
    signal<ExamGenerationCompletedEvent | null>(null);
  readonly examGenerationCompleted = this._examGenerationCompleted.asReadonly();

  private readonly _gradingCompleted = signal<GradingCompletedEvent | null>(null);
  readonly gradingCompleted = this._gradingCompleted.asReadonly();

  private readonly _newChatMessage = signal<NewChatMessageEvent | null>(null);
  readonly newChatMessage = this._newChatMessage.asReadonly();

  constructor() {
    // ── Reactive lifecycle wiring ─────────────────────────────────────────
    // Watch auth.isLoggedIn() and start/stop the hub automatically.
    // This is the correct place (not AuthService) to avoid circular deps.
    effect(() => {
      if (this.auth.isLoggedIn()) {
        void this.startConnection().catch((err: unknown) => {
          console.warn('[SignalR] Auto-connect on login state failed:', err);
        });
      } else {
        void this.stopConnection();
      }
    });

    // Clean up on service destroy (app teardown / tests).
    this.destroyRef.onDestroy(() => {
      void this.stopConnection();
    });
  }

  /**
   * Builds and starts the SignalR hub connection.
   * Attaches the JWT as an access-token factory so SignalR can authenticate
   * WebSocket/SSE connections (Bearer token in query string).
   * No-ops when already connected.
   */
  async startConnection(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) return;

    this.connection = new HubConnectionBuilder()
      .withUrl(environment.signalrHubUrl, {
        accessTokenFactory: () => this.auth.accessToken() ?? '',
      })
      .withAutomaticReconnect(RECONNECT_DELAYS_MS)
      .configureLogging(LogLevel.Warning)
      .build();

    // ── Lifecycle hooks ───────────────────────────────────────────────────
    this.connection.onreconnecting(() => this._status.set('Reconnecting'));
    this.connection.onreconnected(() => this._status.set('Connected'));
    this.connection.onclose(() => this._status.set('Disconnected'));

    // ── Typed server-to-client event handlers ─────────────────────────────
    this.connection.on('MaterialParsed', (payload: MaterialParsedEvent) =>
      this._materialParsed.set(payload),
    );
    this.connection.on(
      'ExamGenerationCompleted',
      (payload: ExamGenerationCompletedEvent) =>
        this._examGenerationCompleted.set(payload),
    );
    this.connection.on('GradingCompleted', (payload: GradingCompletedEvent) =>
      this._gradingCompleted.set(payload),
    );
    this.connection.on('NewChatMessage', (payload: NewChatMessageEvent) =>
      this._newChatMessage.set(payload),
    );

    try {
      this._status.set('Connecting');
      await this.connection.start();
      this._status.set('Connected');
    } catch (err) {
      this._status.set('Error');
      console.error('[SignalR] Connection failed:', err); // legitimate: infra error trace
      throw err;
    }
  }

  /** Gracefully stops the hub connection and resets status. */
  async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this._status.set('Disconnected');
      this.connection = null;
    }
  }

  /**
   * Registers a listener for any server-to-client hub method.
   * Prefer the typed event signals above for standard Draya events.
   */
  on<T>(methodName: string, callback: (data: T) => void): void {
    this.connection?.on(methodName, callback);
  }

  /**
   * Invokes a client-to-server hub method.
   * @throws if not connected
   */
  async invoke<T = void>(methodName: string, ...args: unknown[]): Promise<T> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error('[SignalR] Not connected. Call startConnection() first.');
    }
    return this.connection.invoke<T>(methodName, ...args);
  }
}
