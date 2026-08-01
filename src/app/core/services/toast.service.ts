import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly messageService = inject(MessageService);

  success(message: string, description?: string): void {
    this.messageService.add({
      severity: 'success',
      summary: message,
      detail: description,
    });
  }

  error(message: string, description?: string): void {
    this.messageService.add({
      severity: 'error',
      summary: message,
      detail: description,
    });
  }

  info(message: string, description?: string): void {
    this.messageService.add({
      severity: 'info',
      summary: message,
      detail: description,
    });
  }

  warning(message: string, description?: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: message,
      detail: description,
    });
  }
}
