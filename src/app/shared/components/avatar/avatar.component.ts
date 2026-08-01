import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (src) {
      <img
        [src]="src"
        [alt]="name"
        [ngStyle]="{ 'width.px': size, 'height.px': size }"
        [ngClass]="['rounded-full object-cover shrink-0', className]"
      />
    } @else {
      <div
        [ngStyle]="{
          'width.px': size,
          'height.px': size,
          'font-size': size > 44 ? '17px' : '12px'
        }"
        [ngClass]="[
          'flex items-center justify-center rounded-full font-bold shrink-0 bg-primary/10 text-primary',
          className
        ]"
      >
        {{ initials }}
      </div>
    }
  `
})
export class AvatarComponent implements OnChanges {
  @Input({ required: true }) name!: string;
  @Input() size = 36;
  @Input() src?: string;
  @Input() className = '';

  initials = '';

  ngOnChanges(): void {
    this.calculateInitials();
  }

  private calculateInitials(): void {
    if (!this.name) {
      this.initials = '';
      return;
    }
    this.initials = this.name
      .split(' ')
      .filter(w => w.length > 0)
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
