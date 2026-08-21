import { ErrorHandler, Injectable, Injector, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly injector = inject(Injector);

  handleError(error: unknown): void {
    const router = this.injector.get(Router);
    const zone = this.injector.get(NgZone);

    console.error('Unhandled Exception Caught:', error);

    zone.run(() => {
      let message = 'An unexpected error occurred';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        message = String((error as Record<string, unknown>)['message']);
      } else {
        try {
          message = JSON.stringify(error);
        } catch {
          message = String(error);
        }
      }

      router.navigate(['/error'], {
        skipLocationChange: true,
        state: { error: message },
      });
    });
  }
}
