import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'draya-admin-status-badge',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './admin-status-badge.component.html',
  styleUrls: ['./admin-status-badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminStatusBadgeComponent {
  status = input.required<string>();
  labelKey = input<string>();

  displayKey = computed(() => {
    if (this.labelKey()) {
      return this.labelKey()!;
    }
    return `ADMIN.STATUS.${this.status().toUpperCase()}`;
  });
}
