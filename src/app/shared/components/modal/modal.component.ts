import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'draya-modal',
  standalone: true,
  imports: [CommonModule, DialogModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly hideFooter = input<boolean>(false);

  readonly modalClosed = output<void>();

  readonly maxWidthMap: Record<string, string> = {
    sm: '400px',
    md: '500px',
    lg: '700px',
    xl: '900px',
  };

  onHide(): void {
    this.modalClosed.emit();
  }
}
