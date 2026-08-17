// src/app/shared/components/decorative-scatter/decorative-scatter.component.ts
// Purpose: Dot-matrix grid pattern for empty section header spaces.
// DESIGN.md §3: "light dot-matrix grids to populate empty header spaces."

import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'draya-decorative-scatter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div
      aria-hidden="true"
      class="pointer-events-none absolute"
      [style.inset-inline-end]="offsetInlineEnd()"
      [style.top]="offsetTop()"
      [style.opacity]="opacity()">
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        @for (row of rows; track row) {
          @for (col of cols; track col) {
            <circle
              [attr.cx]="col * 20"
              [attr.cy]="row * 20"
              r="1.5"
              fill="var(--draya-border-strong)" />
          }
        }
      </svg>
    </div>
  `,
})
export class DecorativeScatterComponent {
  readonly offsetInlineEnd = input<string>('0');
  readonly offsetTop = input<string>('0');
  readonly opacity = input<string>('0.45');

  readonly rows = [0, 1, 2, 3, 4, 5, 6, 7];
  readonly cols = [0, 1, 2, 3, 4, 5, 6, 7];
}
