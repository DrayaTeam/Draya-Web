// src/app/core/signalr/signalr.service.ts
// Purpose: Manages the @microsoft/signalr HubConnection lifecycle for the Draya Q&A hub.
// Provides startConnection(), stopConnection(), on() (subscribe to server messages),
// and invoke() (call server hub methods). The connection URL comes from environment.signalrHubUrl.
// Used by the Q&A feature to receive real-time questions and answers from the SignalR hub.

import { Injectable, inject, signal } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { AuthService } from '../../features/auth/services/auth.service';
import { environment } from '../../../environments/environment';

export type SignalRStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private readonly auth = inject(AuthService);
  private connection: HubConnection | null = null;

  /** Reactive connection status exposed to components. */
  readonly status = signal<SignalRStatus>('disconnected');

  /**
   * Builds and starts the SignalR hub connection.
   * Automatically attaches the JWT as an access token factory so SignalR
   * can authenticate WebSocket/SSE connections (Bearer tokens in query string).
   */
  async startConnection(): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) return;

    this.connection = new HubConnectionBuilder()
      .withUrl(environment.signalrHubUrl, {
        accessTokenFactory: () => this.auth.accessToken() ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.onreconnecting(() => this.status.set('connecting'));
    this.connection.onreconnected(() => this.status.set('connected'));
    this.connection.onclose(() => this.status.set('disconnected'));

    try {
      this.status.set('connecting');
      await this.connection.start();
      this.status.set('connected');
    } catch (err) {
      this.status.set('error');
      console.error('[SignalR] Connection failed:', err);
      throw err;
    }
  }

  /** Gracefully stops the hub connection. */
  async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.status.set('disconnected');
    }
  }

  /**
   * Registers a listener for a server-to-client message.
   * @param methodName  The hub method name (e.g. 'QuestionReceived')
   * @param callback    Handler called when the server sends this message
   */
  on<T>(methodName: string, callback: (data: T) => void): void {
    this.connection?.on(methodName, callback);
  }

  /**
   * Invokes a client-to-server hub method.
   * @param methodName  The hub method name (e.g. 'SendQuestion')
   * @param args        Arguments to pass to the server method
   */
  async invoke<T = void>(methodName: string, ...args: unknown[]): Promise<T> {
    if (!this.connection) {
      throw new Error('[SignalR] Not connected. Call startConnection() first.');
    }
    return this.connection.invoke<T>(methodName, ...args);
  }
}
