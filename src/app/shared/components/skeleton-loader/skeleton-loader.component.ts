import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [ngClass]="classes"
      [ngStyle]="customStyle"
      class="relative overflow-hidden bg-gray-200 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent dark:bg-gray-800"></div>
  `,
  styles: [
    `
      @keyframes shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `,
  ],
})
export class SkeletonLoaderComponent implements OnInit {
  @Input() width?: string | number;
  @Input() height?: string | number;
  @Input() variant: 'text' | 'rect' | 'circle' = 'rect';
  @Input() className = '';

  customStyle: Record<string, string> = {};
  classes = '';

  ngOnInit(): void {
    const borderRadius =
      this.variant === 'circle' ? '50%' : this.variant === 'text' ? '4px' : '8px';

    this.customStyle = {
      display: 'block',
      width: this.width
        ? typeof this.width === 'number'
          ? `${this.width}px`
          : this.width
        : '100%',
      height: this.height
        ? typeof this.height === 'number'
          ? `${this.height}px`
          : this.height
        : this.variant === 'text'
          ? '14px'
          : '100px',
      borderRadius,
    };

    this.classes = this.className;
  }
}
