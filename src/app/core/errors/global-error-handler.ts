import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private readonly injector: Injector) {}

  handleError(error: any): void {
    const router = this.injector.get(Router);
    const zone = this.injector.get(NgZone);

    console.error('Unhandled Exception Caught:', error);

    zone.run(() => {
      router.navigate(['/error'], {
        skipLocationChange: true,
        state: { error: error?.message || error?.toString() },
      });
    });
  }
}
