import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="flex flex-col items-center justify-center space-y-4 p-8">
      <span class="i-pi-spinner text-primary h-8 w-8 animate-spin"></span>
      @if (message) {
        <p class="text-muted-foreground text-sm">{{ message | translate }}</p>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() message?: string = 'common.loading';
}
