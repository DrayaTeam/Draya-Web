import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [attr.tabindex]="interactive ? 0 : null"
      [ngClass]="[
        'rounded-xl border border-border bg-card p-6 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary',
        interactive ? 'cursor-pointer hover:border-primary hover:-translate-y-1' : '',
        className
      ]"
      (click)="onClick($event)"
      (keydown.enter)="onKeydown($event)"
      (keydown.space)="onKeydown($event)"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  @Input() interactive = false;
  @Input() className = '';

  @Output() cardClick = new EventEmitter<Event>();

  onClick(event: MouseEvent): void {
    if (this.interactive) {
      this.cardClick.emit(event);
    }
  }

  onKeydown(event: Event): void {
    if (this.interactive) {
      event.preventDefault();
      this.cardClick.emit(event);
    }
  }
}
