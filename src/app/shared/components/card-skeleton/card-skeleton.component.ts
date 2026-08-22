import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardSkeletonType = 'exam' | 'teacher' | 'book' | 'package' | 'stat' | 'generic';

@Component({
  selector: 'draya-card-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-skeleton.component.html',
  styleUrl: './card-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrayaCardSkeletonComponent {
  readonly type = input<CardSkeletonType>('generic');
  readonly count = input<number>(1);
  readonly gridClass = input<string>('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3');

  readonly items = computed<number[]>(() => {
    const c = Math.max(1, this.count());
    return Array.from({ length: c }, (_, i) => i);
  });
}
