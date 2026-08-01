import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <span [class]="iconClass + ' h-6 w-6 text-primary'"></span>
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">{{ title | translate }}</p>
          <h3 class="text-2xl font-bold text-foreground">{{ value }}</h3>
        </div>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input() iconClass = 'i-pi-chart-line';
}
