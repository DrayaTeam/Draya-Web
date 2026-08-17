// src/app/core/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  severity: 'success' | 'error' | 'info' | 'warn';
  summary: string;
  detail?: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  add(
    message: { severity: 'success' | 'error' | 'info' | 'warn'; summary: string; detail?: string },
    duration = 4500,
  ): void {
    const now = Date.now();
    const isDuplicate = this._toasts().some(
      (t) =>
        (t.summary === message.summary || (t.detail && t.detail === message.detail)) &&
        now - t.timestamp < 2000,
    );
    if (isDuplicate) {
      return;
    }

    const id = `toast_${now}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = {
      id,
      severity: message.severity,
      summary: message.summary,
      detail: message.detail,
      timestamp: now,
    };

    // Keep at most 3 toasts visible
    this._toasts.update((current) => [...current.slice(-2), newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(summary: string, detail?: string, duration = 4500): void {
    this.add({ severity: 'success', summary, detail }, duration);
  }

  error(summary: string, detail?: string, duration = 5500): void {
    this.add({ severity: 'error', summary, detail }, duration);
  }

  info(summary: string, detail?: string, duration = 4500): void {
    this.add({ severity: 'info', summary, detail }, duration);
  }

  warning(summary: string, detail?: string, duration = 5000): void {
    this.add({ severity: 'warn', summary, detail }, duration);
  }

  remove(id: string): void {
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
