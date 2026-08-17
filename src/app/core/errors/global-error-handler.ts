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
      const message = error instanceof Error ? error.message : String(error);
      router.navigate(['/error'], {
        skipLocationChange: true,
        state: { error: message },
      });
    });
  }
}
