import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div
      class="border-border bg-card flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div class="bg-accent mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        <span [class]="iconClass + ' text-muted-foreground h-6 w-6'"></span>
      </div>
      <h3 class="text-foreground text-lg font-semibold">{{ title | translate }}</h3>
      <p class="text-muted-foreground mt-2 max-w-sm text-sm">{{ description | translate }}</p>

      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() title = 'COMMON.NO_DATA';
  @Input() description = 'COMMON.NO_DATA_DESCRIPTION';
  @Input() iconClass = 'i-pi-inbox';
}
