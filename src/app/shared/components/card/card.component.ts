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
        'border-border bg-card focus-visible:ring-primary rounded-xl border p-6 transition-all duration-150 outline-none focus-visible:ring-2',
        interactive ? 'hover:border-primary cursor-pointer hover:-translate-y-1' : '',
        className,
      ]"
      (click)="onClick($event)"
      (keydown.enter)="onKeydown($event)"
      (keydown.space)="onKeydown($event)">
      <ng-content></ng-content>
    </div>
  `,
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
