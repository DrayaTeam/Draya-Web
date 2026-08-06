import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-accent mb-4">
        <span [class]="iconClass + ' h-6 w-6 text-muted-foreground'"></span>
      </div>
      <h3 class="text-lg font-semibold text-foreground">{{ title | translate }}</h3>
      <p class="mt-2 max-w-sm text-sm text-muted-foreground">{{ description | translate }}</p>
      
      <ng-content></ng-content>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title = 'COMMON.NO_DATA';
  @Input() description = 'COMMON.NO_DATA_DESCRIPTION';
  @Input() iconClass = 'i-pi-inbox';
}
