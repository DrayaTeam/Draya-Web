import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-section-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [ngClass]="['mb-5 flex items-center justify-between gap-4', className]">
      <div>
        <h2 class="text-foreground text-xl font-bold">
          <ng-content></ng-content>
        </h2>
        @if (sub) {
          <p class="text-muted-foreground mt-1 text-sm">{{ sub }}</p>
        }
      </div>
      <div class="flex items-center gap-2">
        <ng-content select="[action]"></ng-content>
      </div>
    </div>
  `,
})
export class SectionTitleComponent {
  @Input() sub?: string;
  @Input() className = '';
}
