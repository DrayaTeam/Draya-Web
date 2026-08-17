// src/app/shared/components/connection-status-banner/connection-status-banner.component.ts
// Purpose: Dumb presentational banner that slides in when SignalR is Disconnected,
// Reconnecting, or in Error state. It is mounted at the TeacherLayoutComponent level.
// All strings are via ngx-translate. RTL-first, uses DESIGN.md §5 slide-in animation.

import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SignalRService, ConnectionStatus } from '../../../core/signalr/signalr.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'draya-connection-status-banner',
  standalone: true,
  imports: [TranslatePipe, NgClass],
  templateUrl: './connection-status-banner.component.html',
  styleUrl: './connection-status-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionStatusBannerComponent {
  private readonly signalR = inject(SignalRService);

  /** Whether the banner should be visible at all. */
  readonly showBanner = this.signalR.showBanner;

  /** Current connection status for message/icon selection in the template. */
  readonly status = this.signalR.status;

  /** True when reconnecting so we can show the spinner. */
  readonly isReconnecting = (): boolean => (this.status() as ConnectionStatus) === 'Reconnecting';

  /** True when in permanent error state. */
  readonly isError = (): boolean => (this.status() as ConnectionStatus) === 'Error';

  /** Manually retry connection. */
  retryConnection(): void {
    this.signalR.startConnection().catch((err: unknown) => {
      // Intentional: startConnection already logs internally.
      console.warn('[Banner] Retry failed:', err);
    });
  }
}
