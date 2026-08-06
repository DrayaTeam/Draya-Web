import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="flex flex-col items-center justify-center p-8 space-y-4">
      <span class="i-pi-spinner h-8 w-8 animate-spin text-primary"></span>
      @if (message) {
        <p class="text-sm text-muted-foreground">{{ message | translate }}</p>
      }
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() message?: string = 'COMMON.LOADING';
}
