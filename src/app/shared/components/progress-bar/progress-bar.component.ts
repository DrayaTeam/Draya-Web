import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      role="progressbar"
      [attr.aria-valuenow]="pct"
      aria-valuemin="0"
      aria-valuemax="100"
      [ngClass]="['bg-secondary h-1.5 w-full rounded-full', className]">
      <div
        [ngStyle]="{
          'width.%': pct,
          'background-color': color || 'var(--primary)',
        }"
        class="h-full rounded-full transition-[width] duration-300 ease-out"></div>
    </div>
  `,
})
export class ProgressBarComponent implements OnChanges {
  @Input({ required: true }) value!: number;
  @Input() max = 100;
  @Input() color?: string;
  @Input() className = '';

  pct = 0;

  ngOnChanges(): void {
    const denom = this.max || 100;
    this.pct = Math.min(100, Math.round((this.value / denom) * 100));
  }
}
