import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="onClick($event)"
      [ngClass]="[
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
        sizeClasses[size],
        variantClasses[variant],
        disabled || loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      ]">
      @if (loading) {
        <span class="pi pi-spinner pi-spin" style="font-size: 1rem;"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'tertiary' | 'destructive' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() className = '';

  @Output() btnClick = new EventEmitter<MouseEvent>();

  readonly variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-draya-500',
    secondary: 'bg-transparent text-primary border-2 border-primary hover:bg-secondary',
    tertiary: 'bg-transparent text-primary hover:bg-secondary',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  readonly sizeClasses = {
    sm: 'h-8 px-[14px] text-[13px]',
    md: 'h-10 px-[22px] text-[15px]',
    lg: 'h-12 px-[32px] text-base',
  };

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.btnClick.emit(event);
    }
  }
}
