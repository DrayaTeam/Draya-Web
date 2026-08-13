import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div
      class="border-border bg-card rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
      <div class="flex items-center gap-4">
        <div class="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
          <span [class]="iconClass + ' text-primary h-6 w-6'"></span>
        </div>
        <div>
          <p class="text-muted-foreground text-sm font-medium">{{ title | translate }}</p>
          <h3 class="text-foreground text-2xl font-bold">{{ value }}</h3>
        </div>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) value!: string | number;
  @Input() iconClass = 'i-pi-chart-line';
}
