// src/app/shared/components/logo/logo.component.ts
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'draya-logo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
})
export class LogoComponent {
  /** Size of logo: 'sm' (28px), 'md' (36px), 'lg' (44px) */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Text color: 'dark' (#151B19), 'white' (#FFFFFF), 'primary' (#1B6D63) */
  readonly textColor = input<'dark' | 'white' | 'primary'>('dark');

  /** Whether to show text "درايَة" next to icon */
  readonly showText = input<boolean>(true);

  /** Whether clicking logo navigates to home '/' */
  readonly linkable = input<boolean>(true);

  /** Optional custom title override */
  readonly titleText = input<string>('درايَة');

  /** Emits when logo is clicked */
  readonly logoClick = output<void>();

  onLogoClick(): void {
    this.logoClick.emit();
  }
}
