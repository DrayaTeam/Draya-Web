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
  /** Accepts string ('Pending', 'Active'), number (C# Enum 0, 1, 2), or boolean (isActive) */
  status = input<string | number | boolean | null | undefined>('');
  labelKey = input<string>();

  readonly normalizedStatus = computed<string>(() => {
    const raw = this.status();
    if (raw === null || raw === undefined) return 'unknown';

    // Boolean (e.g. isActive)
    if (typeof raw === 'boolean') {
      return raw ? 'active' : 'inactive';
    }

    // Number (C# Enum integer: 0: Pending, 1: Approved, 2: Rejected, 3: Paid, 4: Cancelled)
    if (typeof raw === 'number') {
      switch (raw) {
        case 0:
          return 'pending';
        case 1:
          return 'approved';
        case 2:
          return 'rejected';
        case 3:
          return 'paid';
        case 4:
          return 'cancelled';
        default:
          return String(raw);
      }
    }

    const str = String(raw).trim();
    if (!str) return 'unknown';

    // Handle string number "0", "1", etc.
    if (str === '0') return 'pending';
    if (str === '1') return 'approved';
    if (str === '2') return 'rejected';
    if (str === '3') return 'paid';
    if (str === '4') return 'cancelled';

    return str.toLowerCase();
  });

  readonly statusClass = computed(() => `status-${this.normalizedStatus()}`);

  readonly displayKey = computed(() => {
    if (this.labelKey()) {
      return this.labelKey()!;
    }
    const norm = this.normalizedStatus().toUpperCase();
    return `ADMIN.STATUS.${norm}`;
  });
}
