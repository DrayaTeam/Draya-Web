import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'draya-admin-confirm-dialog',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule],
  templateUrl: './admin-confirm-dialog.component.html',
  styleUrls: ['./admin-confirm-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminConfirmDialogComponent {
  isOpen = input<boolean>(false);
  titleKey = input.required<string>();
  descriptionKey = input.required<string>();
  variant = input<'danger' | 'neutral' | 'danger-with-reason'>('neutral');
  confirmLabelKey = input.required<string>();
  cancelLabelKey = input.required<string>();

  confirmed = output<string | void>();
  cancelled = output<void>();

  reason = signal<string>('');

  cancel() {
    this.reason.set('');
    this.cancelled.emit();
  }

  confirm() {
    if (this.variant() === 'danger-with-reason') {
      this.confirmed.emit(this.reason());
    } else {
      this.confirmed.emit();
    }
    this.reason.set('');
  }
}
