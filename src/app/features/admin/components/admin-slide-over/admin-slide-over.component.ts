import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'draya-admin-slide-over',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-slide-over.component.html',
  styleUrls: ['./admin-slide-over.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSlideOverComponent {
  isOpen = input<boolean>(false);
  title = input.required<string>();
  width = input<'sm' | 'md' | 'lg'>('md');

  closed = output<void>();

  widthClass = computed(() => {
    switch (this.width()) {
      case 'sm':
        return '400px';
      case 'md':
        return '440px';
      case 'lg':
        return '560px';
      default:
        return '440px';
    }
  });

  close() {
    this.closed.emit();
  }
}
