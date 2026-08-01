import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [ngClass]="[
        'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap',
        sizeClasses[size],
        variantClasses[variant],
        className
      ]"
    >
      @if (variant === 'ai') {
        <span class="pi pi-sparkles" style="font-size: 0.65rem;"></span>
      }
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  @Input() variant: 'success' | 'warning' | 'error' | 'info' | 'ai' | 'draft' | 'primary' = 'info';
  @Input() size: 'sm' | 'md' = 'sm';
  @Input() className = '';

  readonly variantClasses = {
    success: 'bg-green-500/12 text-green-600 dark:text-green-400',
    warning: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
    error: 'bg-red-500/12 text-red-600 dark:text-red-400',
    info: 'bg-blue-500/12 text-blue-600 dark:text-blue-400',
    ai: 'bg-purple-500/12 text-purple-600 dark:text-purple-400',
    draft: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
  };

  readonly sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-[13px]',
  };
}
