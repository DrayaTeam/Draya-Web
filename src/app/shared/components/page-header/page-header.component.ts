import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-foreground">{{ title }}</h1>
        @if (subtitle) {
          <p class="text-sm text-muted-foreground mt-1">{{ subtitle }}</p>
        }
      </div>
      <div class="flex items-center gap-2">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
