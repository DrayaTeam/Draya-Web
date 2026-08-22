// src/app/core/signalr/signalr.service.ts
// Purpose: Manages the @microsoft/signalr HubConnection lifecycle for the Draya notification hub.
// - Watches auth.isLoggedIn via effect() to start/stop automatically — NO circular dep.
// - Exposes typed event signals for each real-time event (US-115, CONTEXT.md §Real-Time Events).
// - Implements exponential backoff on top of withAutomaticReconnect().
// - Status signal is read-only to prevent external mutation.
// - Gated by environment.enableNotificationsHub: when false the connection is skipped entirely
//   so the browser never emits a red 404 negotiate error for /hubs/notifications.

import { Injectable, inject, signal, computed, effect, DestroyRef } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { AuthService } from '../../features/auth';
import { environment } from '../../../environments/environment';
import type {
  MaterialParsedEvent,
  ExamGenerationCompletedEvent,
  GradingCompletedEvent,
  NewChatMessageEvent,
  GenerationProgressEvent,
} from '../models/signalr-events.model';

export type ConnectionStatus =
  'Disconnected' | 'Connecting' | 'Reconnecting' | 'Connected' | 'Error';

/** Exponential backoff intervals (ms) for the automatic-reconnect policy. */
const RECONNECT_DELAYS_MS: number[] = [0, 2000, 5000, 10000, 30000];

@Injectable({ providedIn: 'root' })
export class SignalRService {
  // AuthService injects NO SignalRService → one-way dep, no cycle.
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private connection: HubConnection | null = null;
  private examGenConnection: HubConnection | null = null;

  // ─── Connection status ────────────────────────────────────────────────────
  private readonly _status = signal<ConnectionStatus>('Disconnected');
  /** Reactive connection status. Read-only to prevent external mutation. */
  readonly status = this._status.asReadonly();

  /** True when the connection is degraded and the user should be notified. */
  readonly showBanner = computed<boolean>(
    () => this._status() === 'Reconnecting' || this._status() === 'Error',
  );

  // ─── Typed event signals ──────────────────────────────────────────────────
  private readonly _materialParsed = signal<MaterialParsedEvent | null>(null);
  readonly materialParsed = this._materialParsed.asReadonly();

  private readonly _examGenerationCompleted = signal<ExamGenerationCompletedEvent | null>(null);
  readonly examGenerationCompleted = this._examGenerationCompleted.asReadonly();

  private readonly _gradingCompleted = signal<GradingCompletedEvent | null>(null);
  readonly gradingCompleted = this._gradingCompleted.asReadonly();

  private readonly _newChatMessage = signal<NewChatMessageEvent | null>(null);
  readonly newChatMessage = this._newChatMessage.asReadonly();

  private readonly _generationProgressUpdated = signal<GenerationProgressEvent | null>(null);
  readonly generationProgressUpdated = this._generationProgressUpdated.asReadonly();

  constructor() {
    // ── Reactive lifecycle wiring ─────────────────────────────────────────
    // Watch auth.isLoggedIn() and start/stop the hub automatically.
    // This is the correct place (not AuthService) to avoid circular deps.
    effect(() => {
      if (this.auth.isAuthenticated()) {
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
   *
   * NOTE: This method is gated by environment.enableNotificationsHub.
   * When the flag is false the negotiate request is never sent, preventing
   * the red 404 console errors from /hubs/notifications while that hub is
   * not yet mapped on the backend. Flip the flag to true once the backend
   * confirms /hubs/notifications is live.
   */
  async startConnection(): Promise<void> {
    // ── Feature gate ─────────────────────────────────────────────────────
    if (!environment.enableNotificationsHub) {
      // Single quiet log — not an error. Only fires once per connection attempt.
      console.warn(
        '[SignalR] Notifications hub disabled via config — skipping connection attempt.',
      );
      return;
    }

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
    this.connection.on('ExamGenerationCompleted', (payload: ExamGenerationCompletedEvent) =>
      this._examGenerationCompleted.set(payload),
    );
    this.connection.on('GradingCompleted', (payload: GradingCompletedEvent) =>
      this._gradingCompleted.set(payload),
    );
    this.connection.on('GradingJobCompleted', (payload: GradingCompletedEvent) =>
      this._gradingCompleted.set(payload),
    );
    this.connection.on('AttemptGraded', (payload: GradingCompletedEvent) =>
      this._gradingCompleted.set(payload),
    );
    this.connection.on('ExamGraded', (payload: GradingCompletedEvent) =>
      this._gradingCompleted.set(payload),
    );
    this.connection.on('NewChatMessage', (payload: NewChatMessageEvent) =>
      this._newChatMessage.set(payload),
    );

    try {
      this._status.set('Connecting');
      await this.connection.start();
      this._status.set('Connected');
    } catch (err: unknown) {
      // If hub is not mapped on backend (404), stay disconnected gracefully
      const is404 =
        err instanceof Error &&
        (err.message.includes('404') || (err as { statusCode?: number }).statusCode === 404);
      if (is404) {
        this._status.set('Disconnected');
        console.warn(
          '[SignalR] Hub endpoint not available on backend, running in offline/polling mode.',
        );
      } else {
        this._status.set('Error');
        console.error('[SignalR] Connection failed:', err);
      }
    }
  }

  /**
   * Builds and starts the SignalR Exam Generation Hub connection (/hubs/exam-generation).
   * Listens for GenerationProgressUpdated events from the background AI generator.
   */
  async startExamGenerationHub(): Promise<void> {
    if (this.examGenConnection?.state === HubConnectionState.Connected) {
      return;
    }

    const token = this.auth.accessToken() ?? '';
    const hubUrl = environment.examHubUrl || '/hubs/exam-generation';

    this.examGenConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect(RECONNECT_DELAYS_MS)
      .configureLogging(LogLevel.Warning)
      .build();

    const handleProgress = (data: GenerationProgressEvent) => {
      console.log('[SignalR] GenerationProgressUpdated received:', data);
      this._generationProgressUpdated.set(data);
    };

    this.examGenConnection.on('GenerationProgressUpdated', handleProgress);
    this.examGenConnection.on('generationProgressUpdated', handleProgress);
    this.examGenConnection.on('ReceiveProgress', handleProgress);
    this.examGenConnection.on('ExamGenerationProgress', handleProgress);

    try {
      await this.examGenConnection.start();
      console.log('[SignalR] Connected to /hubs/exam-generation successfully.');
    } catch (err) {
      console.warn('[SignalR] /hubs/exam-generation connection failed:', err);
    }
  }

  /** Gracefully stops the exam generation hub connection. */
  async stopExamGenerationHub(): Promise<void> {
    if (this.examGenConnection) {
      await this.examGenConnection.stop();
      this.examGenConnection = null;
    }
  }

  /** Gracefully stops the hub connection and resets status. */
  async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this._status.set('Disconnected');
      this.connection = null;
    }
    await this.stopExamGenerationHub();
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
