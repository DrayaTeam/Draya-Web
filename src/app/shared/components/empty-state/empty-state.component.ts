import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'draya-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input<string>('inbox');
  readonly titleKey = input.required<string>();
  readonly descriptionKey = input<string | undefined>(undefined);
  readonly primaryActionLabelKey = input<string | undefined>(undefined);
  readonly primaryActionRoute = input<string | (string | number)[] | undefined>(undefined);
  readonly secondaryActionLabelKey = input<string | undefined>(undefined);
  readonly secondaryActionRoute = input<string | (string | number)[] | undefined>(undefined);
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly primaryActionClick = output<void>();
  readonly secondaryActionClick = output<void>();

  onPrimaryClick(): void {
    this.primaryActionClick.emit();
  }

  onSecondaryClick(): void {
    this.secondaryActionClick.emit();
  }
}
