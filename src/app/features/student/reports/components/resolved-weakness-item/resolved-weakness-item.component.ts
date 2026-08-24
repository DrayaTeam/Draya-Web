import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { StudentWeaknessItem } from '../../../../../core/models/student-weakness.model';

@Component({
  selector: 'app-resolved-weakness-item',
  standalone: true,
  imports: [],
  templateUrl: './resolved-weakness-item.component.html',
  styleUrl: './resolved-weakness-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResolvedWeaknessItemComponent {
  readonly weakness = input.required<StudentWeaknessItem>();

  // proficiencyPercent is already a normalized 0-100 value from the service
  // (StudentWeaknessService), which itself is confirmed against swagger — no
  // magnitude-guessing needed here. A resolved weakness with no percent at
  // all (shouldn't happen, but the field isn't guaranteed) reads as mastered.
  readonly proficiencyPercent = computed(() => {
    const raw = this.weakness().proficiencyPercent;
    return raw > 0 ? Math.max(0, Math.min(100, Math.round(raw))) : 100;
  });

  readonly masteryMessage = computed(() => {
    const delta = this.weakness().delta;
    if (delta !== undefined && delta > 0) {
      return `تحسن مستمر بمقدار +${delta}% 📈`;
    }
    const pct = this.proficiencyPercent();
    if (pct >= 90) {
      return 'أداء ممتاز ومتقن بنجاح 🌟';
    }
    return 'تم تجاوز التحدي وتثبيت المفاهيم 🎯';
  });
}
