import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-global-error-fallback',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div class="flex w-full max-w-md flex-col items-center justify-center rounded-xl border border-red-500/15 bg-red-500/[0.04] p-12 text-center">
        <div class="mb-4 text-red-500">
          <span class="pi pi-exclamation-circle" style="font-size: 3rem;"></span>
        </div>
        <h3 class="text-lg font-bold text-foreground mb-2">
          {{ 'error.title' | translate }}
        </h3>
        <p class="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
          {{ errorMessage || ('error.defaultMessage' | translate) }}
        </p>
        <button
          (click)="onRetry()"
          class="px-6 py-2 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition active:scale-[0.98]">
          {{ 'error.retryButton' | translate }}
        </button>
      </div>
    </div>
  `
})
export class GlobalErrorFallbackComponent {
  private readonly router = inject(Router);
  errorMessage = '';

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { error?: string };
    if (state && state.error) {
      this.errorMessage = state.error;
    }
  }

  onRetry(): void {
    this.router.navigate(['/']);
  }
}
