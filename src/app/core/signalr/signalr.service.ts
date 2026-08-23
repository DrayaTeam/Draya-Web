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
  HttpTransportType,
} from '@microsoft/signalr';
import { AuthService } from '../../features/auth/services/auth.service';
import { NotificationStoreService } from '../services/notification-store.service';
import { environment } from '../../../environments/environment';
import type {
  MaterialParsedEvent,
  ExamGenerationCompletedEvent,
  GradingCompletedEvent,
  NewChatMessageEvent,
  GenerationProgressEvent,
  ReportGeneratedEvent,
  StudentAtRiskEvent,
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
  private readonly notificationStore = inject(NotificationStoreService);

  private connection: HubConnection | null = null;
  private examGenConnection: HubConnection | null = null;
  private reportsConnection: HubConnection | null = null;

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

  // ─── Hub D: Reports hub signals ───────────────────────────────────────────
  private readonly _reportGenerated = signal<ReportGeneratedEvent | null>(null);
  /** Fires when an AI performance report finishes generating. (Hub D: /hubs/reports) */
  readonly reportGenerated = this._reportGenerated.asReadonly();

  private readonly _studentAtRisk = signal<StudentAtRiskEvent | null>(null);
  /** Fires when the system detects a student is severely falling behind. (Hub D: /hubs/reports) */
  readonly studentAtRisk = this._studentAtRisk.asReadonly();

  constructor() {
    // ── Reactive lifecycle wiring ─────────────────────────────────────────
    // Watch auth.isLoggedIn() and start/stop the hub automatically.
    // This is the correct place (not AuthService) to avoid circular deps.
    effect(() => {
      if (this.auth.isAuthenticated()) {
        void this.startConnection().catch((err: unknown) => {
          console.warn('[SignalR] Auto-connect on login state failed:', err);
        });
        void this.startReportsHub().catch((err: unknown) => {
          console.warn('[SignalR] Reports hub auto-connect failed:', err);
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
    this.connection.on('MaterialParsed', (payload: MaterialParsedEvent) => {
      this._materialParsed.set(payload);
      this.notificationStore.addNotification({
        title: 'معالجة المذكرات الدراسية',
        message: payload.message || 'تمت معالجة المذكرة بنجاح بالذكاء الاصطناعي',
        type: payload.status === 'Success' ? 'success' : 'error',
        link: '/teacher/library',
      });
    });
    this.connection.on('ExamGenerationCompleted', (payload: ExamGenerationCompletedEvent) => {
      this._examGenerationCompleted.set(payload);
      this.notificationStore.addNotification({
        title: 'اكتمال إنشاء الامتحان الذكي',
        message: 'تم توليد أسئلة الامتحان بالذكاء الاصطناعي وأصبحت جاهزة للمراجعة والاعتماد.',
        type: 'success',
        link: `/teacher/exams/${payload.examId}/review`,
      });
    });
    this.connection.on('GradingCompleted', (payload: GradingCompletedEvent) => {
      this._gradingCompleted.set(payload);
      this.notificationStore.addNotification({
        title: 'اكتمال تصحيح الامتحان',
        message:
          payload.totalScore !== undefined
            ? `تم الانتهاء من تصحيح امتحانك. درجتك: ${payload.totalScore}`
            : 'تم الانتهاء من تصحيح امتحانك بنجاح.',
        type: 'success',
        link: '/student/reports',
      });
    });
    this.connection.on('GradingJobCompleted', (payload: GradingCompletedEvent) => {
      this._gradingCompleted.set(payload);
    });
    this.connection.on('AttemptGraded', (payload: GradingCompletedEvent) => {
      this._gradingCompleted.set(payload);
    });
    this.connection.on('ExamGraded', (payload: GradingCompletedEvent) => {
      this._gradingCompleted.set(payload);
    });
    this.connection.on('NewChatMessage', (payload: NewChatMessageEvent) => {
      this._newChatMessage.set(payload);
    });

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

  /**
   * Builds and starts the SignalR Reports Hub connection (/hubs/reports).
   * Listens for ReportGenerated and StudentAtRisk events from the backend.
   * Gated by environment.enableReportsHub.
   */
  async startReportsHub(): Promise<void> {
    if (!environment.enableReportsHub) {
      console.warn('[SignalR] Reports hub disabled via config — skipping.');
      return;
    }

    if (this.reportsConnection?.state === HubConnectionState.Connected) {
      return;
    }

    const hubUrl = environment.reportsHubUrl ?? '/hubs/reports';

    this.reportsConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => this.auth.accessToken() ?? '',
        transport: HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Warning)
      .build();

    this.reportsConnection.on('ReportGenerated', (data: ReportGeneratedEvent) => {
      console.log('[SignalR] ReportGenerated:', data);
      this._reportGenerated.set(data);
      this.notificationStore.addNotification({
        title: 'تقرير أداء جديد جاهز',
        message: 'تم توليد تقرير أداء ذكي وتحليل شامل لنقاط القوة والضعف للطالب.',
        type: 'info',
        link: '/teacher/reports',
      });
    });

    this.reportsConnection.on('StudentAtRisk', (data: StudentAtRiskEvent) => {
      console.log('[SignalR] StudentAtRisk:', data);
      this._studentAtRisk.set(data);
      this.notificationStore.addNotification({
        title: 'تنبيه: متابعة طالب متعثر ⚠️',
        message: `تم رصد تعثر طالب في موضوع: ${data.topicName}. يُرجى مراجعة التقرير والتوصيات المخصصة.`,
        type: 'warning',
        link: '/teacher/reports',
      });
    });

    try {
      await this.reportsConnection.start();
      console.log('[SignalR] Connected to /hubs/reports successfully.');
    } catch (err) {
      console.warn('[SignalR] /hubs/reports connection failed:', err);
    }
  }

  /** Gracefully stops the reports hub connection. */
  async stopReportsHub(): Promise<void> {
    if (this.reportsConnection) {
      await this.reportsConnection.stop();
      this.reportsConnection = null;
    }
  }

  /** Gracefully stops all hub connections and resets status. */
  async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this._status.set('Disconnected');
      this.connection = null;
    }
    await this.stopExamGenerationHub();
    await this.stopReportsHub();
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
